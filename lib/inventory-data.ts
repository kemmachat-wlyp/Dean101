import { supabaseAdmin } from "./supabase-admin";

export interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface MeasurementRecord {
  id: number;
  itemId: number;
  pitToPit: number | null;
  length: number | null;
}

export interface PhotoRecord {
  id: number;
  itemId: number;
  filePath: string;
  isCover: boolean;
  createdAt: string;
}

export interface SaleRecord {
  id: number;
  saleId: string;
  itemId: number;
  platform: string;
  sellPrice: number;
  platformFee: number;
  shippingCost: number;
  netProfit: number;
  saleDate: string;
  createdAt: string;
}

export interface ItemRecord {
  id: number;
  itemId: string;
  title: string;
  category: string;
  brand: string | null;
  sizeTag: string;
  condition: string;
  yearEstimate: string | null;
  color: string | null;
  country: string | null;
  notes: string | null;
  cost: number;
  targetPrice: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithRelations extends ItemRecord {
  measurement: MeasurementRecord | null;
  photos: PhotoRecord[];
  sale: SaleRecord | null;
}

interface ItemFilters {
  search?: string;
  category?: string;
  status?: string;
  sizeTag?: string;
}

function assertNoError<T>(result: { data: T; error: { message: string } | null }, label: string): T {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result.data;
}

function toMap<T extends { itemId: number }>(rows: T[]) {
  const map = new Map<number, T[]>();

  for (const row of rows) {
    const group = map.get(row.itemId) ?? [];
    group.push(row);
    map.set(row.itemId, group);
  }

  return map;
}

export async function getUserByUsername(username: string) {
  const data = assertNoError(
    await supabaseAdmin.from("User").select("*").eq("username", username).maybeSingle(),
    "Failed to fetch user"
  );

  return data as UserRecord | null;
}

export async function getLastItem() {
  const data = assertNoError(
    await supabaseAdmin.from("Item").select("*").order("id", { ascending: false }).limit(1).maybeSingle(),
    "Failed to fetch last item"
  );

  return data as ItemRecord | null;
}

export async function listItems(filters: ItemFilters = {}) {
  let query = supabaseAdmin.from("Item").select("*").order("createdAt", { ascending: false });

  if (filters.search) {
    query = query.or(`itemId.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.sizeTag) {
    query = query.eq("sizeTag", filters.sizeTag);
  }

  const items = assertNoError(await query, "Failed to fetch items") as ItemRecord[];
  return attachRelations(items);
}

export async function getItemById(itemId: number) {
  const item = assertNoError(
    await supabaseAdmin.from("Item").select("*").eq("id", itemId).maybeSingle(),
    "Failed to fetch item"
  ) as ItemRecord | null;

  if (!item) {
    return null;
  }

  const [measurement, photos, sale] = await Promise.all([
    getMeasurementByItemId(itemId),
    listPhotosByItemId(itemId),
    getSaleByItemId(itemId),
  ]);

  return {
    ...item,
    measurement,
    photos,
    sale,
  } satisfies ItemWithRelations;
}

export async function createItem(input: {
  itemId: string;
  title: string;
  category: string;
  brand: string | null;
  sizeTag: string;
  condition: string;
  yearEstimate: string | null;
  color: string | null;
  country: string | null;
  notes: string | null;
  cost: number;
  targetPrice: number | null;
  status: string;
  pitToPit: number | null;
  length: number | null;
}) {
  const item = assertNoError(
    await supabaseAdmin
      .from("Item")
      .insert({
        itemId: input.itemId,
        title: input.title,
        category: input.category,
        brand: input.brand,
        sizeTag: input.sizeTag,
        condition: input.condition,
        yearEstimate: input.yearEstimate,
        color: input.color,
        country: input.country,
        notes: input.notes,
        cost: input.cost,
        targetPrice: input.targetPrice,
        status: input.status,
        updatedAt: new Date().toISOString(),
      })
      .select("*")
      .single(),
    "Failed to create item"
  ) as ItemRecord;

  const measurement = assertNoError(
    await supabaseAdmin
      .from("Measurement")
      .insert({
        itemId: item.id,
        pitToPit: input.pitToPit,
        length: input.length,
      })
      .select("*")
      .single(),
    "Failed to create measurement"
  ) as MeasurementRecord;

  return {
    ...item,
    measurement,
    photos: [],
    sale: null,
  } satisfies ItemWithRelations;
}

export async function updateItem(
  itemId: number,
  input: {
    title: string;
    category: string;
    brand: string | null;
    sizeTag: string;
    condition: string;
    yearEstimate: string | null;
    color: string | null;
    country: string | null;
    notes: string | null;
    cost: number;
    targetPrice: number | null;
    status: string;
    pitToPit: number | null;
    length: number | null;
  }
) {
  const item = assertNoError(
    await supabaseAdmin
      .from("Item")
      .update({
        title: input.title,
        category: input.category,
        brand: input.brand,
        sizeTag: input.sizeTag,
        condition: input.condition,
        yearEstimate: input.yearEstimate,
        color: input.color,
        country: input.country,
        notes: input.notes,
        cost: input.cost,
        targetPrice: input.targetPrice,
        status: input.status,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select("*")
      .single(),
    "Failed to update item"
  ) as ItemRecord;

  const existingMeasurement = await getMeasurementByItemId(itemId);
  const measurementPayload = {
    itemId,
    pitToPit: input.pitToPit,
    length: input.length,
  };

  const measurement = existingMeasurement
    ? (assertNoError(
        await supabaseAdmin
          .from("Measurement")
          .update(measurementPayload)
          .eq("itemId", itemId)
          .select("*")
          .single(),
        "Failed to update measurement"
      ) as MeasurementRecord)
    : (assertNoError(
        await supabaseAdmin.from("Measurement").insert(measurementPayload).select("*").single(),
        "Failed to create measurement"
      ) as MeasurementRecord);

  const [photos, sale] = await Promise.all([listPhotosByItemId(itemId), getSaleByItemId(itemId)]);

  return {
    ...item,
    measurement,
    photos,
    sale,
  } satisfies ItemWithRelations;
}

export async function deleteItem(itemId: number) {
  assertNoError(await supabaseAdmin.from("Photo").delete().eq("itemId", itemId), "Failed to delete photos");
  assertNoError(await supabaseAdmin.from("Sale").delete().eq("itemId", itemId), "Failed to delete sale");
  assertNoError(
    await supabaseAdmin.from("Measurement").delete().eq("itemId", itemId),
    "Failed to delete measurement"
  );
  assertNoError(await supabaseAdmin.from("Item").delete().eq("id", itemId), "Failed to delete item");
}

export async function listPhotosByItemId(itemId: number) {
  const data = assertNoError(
    await supabaseAdmin.from("Photo").select("*").eq("itemId", itemId).order("createdAt", { ascending: true }),
    "Failed to fetch photos"
  );

  return data as PhotoRecord[];
}

export async function getPhotoById(photoId: number) {
  const data = assertNoError(
    await supabaseAdmin.from("Photo").select("*").eq("id", photoId).maybeSingle(),
    "Failed to fetch photo"
  );

  return data as PhotoRecord | null;
}

export async function createPhoto(itemId: number, filePath: string, isCover: boolean) {
  const data = assertNoError(
    await supabaseAdmin
      .from("Photo")
      .insert({
        itemId,
        filePath,
        isCover,
      })
      .select("*")
      .single(),
    "Failed to create photo"
  );

  return data as PhotoRecord;
}

export async function setItemCoverPhoto(photoId: number, itemId: number) {
  assertNoError(
    await supabaseAdmin.from("Photo").update({ isCover: false }).eq("itemId", itemId),
    "Failed to clear cover photo"
  );

  const data = assertNoError(
    await supabaseAdmin.from("Photo").update({ isCover: true }).eq("id", photoId).select("*").single(),
    "Failed to set cover photo"
  );

  return data as PhotoRecord;
}

export async function deletePhoto(photoId: number) {
  assertNoError(await supabaseAdmin.from("Photo").delete().eq("id", photoId), "Failed to delete photo");
}

export async function createSale(input: {
  saleId: string;
  itemId: number;
  platform: string;
  sellPrice: number;
  platformFee: number;
  shippingCost: number;
  netProfit: number;
  saleDate: string;
}) {
  const sale = assertNoError(
    await supabaseAdmin
      .from("Sale")
      .insert({
        saleId: input.saleId,
        itemId: input.itemId,
        platform: input.platform,
        sellPrice: input.sellPrice,
        platformFee: input.platformFee,
        shippingCost: input.shippingCost,
        netProfit: input.netProfit,
        saleDate: input.saleDate,
      })
      .select("*")
      .single(),
    "Failed to create sale"
  ) as SaleRecord;

  assertNoError(
    await supabaseAdmin.from("Item").update({ status: "Sold", updatedAt: new Date().toISOString() }).eq("id", input.itemId),
    "Failed to update item status"
  );

  return sale;
}

export async function getSaleByItemId(itemId: number) {
  const data = assertNoError(
    await supabaseAdmin.from("Sale").select("*").eq("itemId", itemId).maybeSingle(),
    "Failed to fetch sale"
  );

  return data as SaleRecord | null;
}

export async function getMeasurementByItemId(itemId: number) {
  const data = assertNoError(
    await supabaseAdmin.from("Measurement").select("*").eq("itemId", itemId).maybeSingle(),
    "Failed to fetch measurement"
  );

  return data as MeasurementRecord | null;
}

export async function listCategoriesWithCounts() {
  const rows = assertNoError(await supabaseAdmin.from("Item").select("category"), "Failed to fetch categories") as Pick<
    ItemRecord,
    "category"
  >[];

  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, _count: count }))
    .sort((left, right) => left.category.localeCompare(right.category));
}

export async function listSizeTagsWithCounts() {
  const rows = assertNoError(await supabaseAdmin.from("Item").select("sizeTag"), "Failed to fetch sizes") as Pick<
    ItemRecord,
    "sizeTag"
  >[];

  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.sizeTag, (counts.get(row.sizeTag) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([sizeTag, count]) => ({ sizeTag, _count: count }))
    .sort((left, right) => left.sizeTag.localeCompare(right.sizeTag));
}

export async function countItems() {
  const result = await supabaseAdmin.from("Item").select("id", { count: "exact", head: true });

  if (result.error) {
    throw new Error(`Failed to count items: ${result.error.message}`);
  }

  return result.count ?? 0;
}

export async function countAvailableItems() {
  const result = await supabaseAdmin
    .from("Item")
    .select("id", { count: "exact", head: true })
    .neq("status", "Sold");

  if (result.error) {
    throw new Error(`Failed to count available items: ${result.error.message}`);
  }

  return result.count ?? 0;
}

export async function countSales() {
  const result = await supabaseAdmin.from("Sale").select("id", { count: "exact", head: true });

  if (result.error) {
    throw new Error(`Failed to count sales: ${result.error.message}`);
  }

  return result.count ?? 0;
}

export async function listSalesSince(isoDate: string) {
  const data = assertNoError(
    await supabaseAdmin.from("Sale").select("*").gte("saleDate", isoDate),
    "Failed to fetch sales"
  );

  return data as SaleRecord[];
}

export async function listItemsByStatuses(statuses: string[]) {
  const data = assertNoError(
    await supabaseAdmin.from("Item").select("*").in("status", statuses),
    "Failed to fetch items by status"
  );

  return data as ItemRecord[];
}

export async function listAllItems() {
  const data = assertNoError(await supabaseAdmin.from("Item").select("*"), "Failed to fetch all items");
  return data as ItemRecord[];
}

async function attachRelations(items: ItemRecord[]) {
  if (items.length === 0) {
    return [] as ItemWithRelations[];
  }

  const itemIds = items.map((item) => item.id);

  const [measurements, photos, sales] = await Promise.all([
    assertNoError(
      await supabaseAdmin.from("Measurement").select("*").in("itemId", itemIds),
      "Failed to fetch measurements"
    ) as MeasurementRecord[],
    assertNoError(await supabaseAdmin.from("Photo").select("*").in("itemId", itemIds), "Failed to fetch photos") as PhotoRecord[],
    assertNoError(await supabaseAdmin.from("Sale").select("*").in("itemId", itemIds), "Failed to fetch sales") as SaleRecord[],
  ]);

  const measurementMap = new Map(measurements.map((measurement) => [measurement.itemId, measurement]));
  const photoMap = toMap(photos);
  const saleMap = new Map(sales.map((sale) => [sale.itemId, sale]));

  return items.map((item) => ({
    ...item,
    measurement: measurementMap.get(item.id) ?? null,
    photos: photoMap.get(item.id) ?? [],
    sale: saleMap.get(item.id) ?? null,
  }));
}
