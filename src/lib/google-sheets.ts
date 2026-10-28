import { google } from 'googleapis';
import {
  VanBanDen,
  VanBanDi,
  DanhMucItem,
  ThongKeItem,
  CauHinhItem,
  DashboardStats,
} from './types';
import {
  INITIAL_MOCK_VAN_BAN_DEN,
  INITIAL_MOCK_VAN_BAN_DI,
  INITIAL_MOCK_DANH_MUC,
  INITIAL_MOCK_THONG_KE,
  INITIAL_MOCK_CAU_HINH,
} from './mock-data';
import { generateDocumentId } from './utils';

// Biến lưu trữ tạm trên bộ nhớ khi chưa cấu hình Google Service Account
let inMemoryVanBanDen: VanBanDen[] = [...INITIAL_MOCK_VAN_BAN_DEN];
let inMemoryVanBanDi: VanBanDi[] = [...INITIAL_MOCK_VAN_BAN_DI];
const inMemoryDanhMuc: DanhMucItem[] = [...INITIAL_MOCK_DANH_MUC];
const inMemoryThongKe: ThongKeItem[] = [...INITIAL_MOCK_THONG_KE];
const inMemoryCauHinh: CauHinhItem[] = [...INITIAL_MOCK_CAU_HINH];

const DATABASE_ID = process.env.DOCFLOW_DATABASE_ID || '1LX5rXm81Mnm_sQcjXVzVGLFmD4LICuLCvnbzV3pf-zY';
const SYSTEM_ID = process.env.DOCFLOW_SYSTEM_ID || '1tDAYBobgTBcCg61H0LieZvTbk-MDsZDhYvQtqW_oWQc';

/**
 * Kiểm tra xem cấu hình Google Service Account đã được cung cấp chưa
 */
export function isGoogleCredentialsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CLIENT_EMAIL.trim() !== '' &&
    process.env.GOOGLE_PRIVATE_KEY.trim() !== ''
  );
}

/**
 * Tạo Google Sheets Client đã xác thực qua Service Account
 */
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Chưa cấu hình GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY');
  }

  // Xử lý xuống dòng trong Private Key nếu được escape qua biến môi trường
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// ==============================================================================
// 1. QUẢN LÝ VĂN BẢN ĐẾN (Sheet: VAN_BAN_DEN - 21 cột)
// ==============================================================================

/**
 * Chuyển đổi một dòng dữ liệu từ Google Sheets thành đối tượng VanBanDen
 */
function rowToVanBanDen(row: any[]): VanBanDen {
  return {
    id: String(row[0] || ''),
    nam: Number(row[1]) || new Date().getFullYear(),
    so_den: Number(row[2]) || 0,
    ngay_den: String(row[3] || ''),
    so_ky_hieu: String(row[4] || ''),
    ngay_ban_hanh: String(row[5] || ''),
    co_quan_gui: String(row[6] || ''),
    loai_van_ban: String(row[7] || ''),
    trich_yeu: String(row[8] || ''),
    lanh_dao_chi_dao: String(row[9] || ''),
    nguoi_xu_ly: String(row[10] || ''),
    noi_dung_chi_dao: String(row[11] || ''),
    han_xu_ly: String(row[12] || ''),
    trang_thai: (row[13] || 'Chưa xử lý') as any,
    ngay_hoan_thanh: String(row[14] || ''),
    ket_qua_xu_ly: String(row[15] || ''),
    muc_do_uu_tien: (row[16] || 'Thường') as any,
    link_dinh_kem: String(row[17] || ''),
    ghi_chu: String(row[18] || ''),
    ngay_tao: String(row[19] || ''),
    ngay_cap_nhat: String(row[20] || ''),
  };
}

/**
 * Chuyển đổi đối tượng VanBanDen thành mảng 21 phần tử để ghi vào Google Sheets
 */
function vanBanDenToRow(doc: VanBanDen): any[] {
  return [
    doc.id,
    doc.nam,
    doc.so_den,
    doc.ngay_den,
    doc.so_ky_hieu,
    doc.ngay_ban_hanh,
    doc.co_quan_gui,
    doc.loai_van_ban,
    doc.trich_yeu,
    doc.lanh_dao_chi_dao,
    doc.nguoi_xu_ly,
    doc.noi_dung_chi_dao,
    doc.han_xu_ly,
    doc.trang_thai,
    doc.ngay_hoan_thanh,
    doc.ket_qua_xu_ly,
    doc.muc_do_uu_tien,
    doc.link_dinh_kem,
    doc.ghi_chu,
    doc.ngay_tao,
    doc.ngay_cap_nhat,
  ];
}

/**
 * Lấy danh sách toàn bộ văn bản đến
 */
export async function getVanBanDenList(): Promise<{ data: VanBanDen[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryVanBanDen, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A2:U',
    });

    const rows = res.data.values || [];
    const list: VanBanDen[] = rows
      .filter((r) => r && r[0]) // Bỏ qua dòng trống không có ID
      .map(rowToVanBanDen);

    return { data: list, isDemo: false };
  } catch (error) {
    console.warn('[DocFlow Sheets API] Lỗi kết nối Google Sheets, chuyển sang chế độ Demo:', error);
    return { data: inMemoryVanBanDen, isDemo: true };
  }
}

/**
 * Thêm một văn bản đến mới
 */
export async function addVanBanDen(
  docData: Omit<VanBanDen, 'id' | 'ngay_tao' | 'ngay_cap_nhat'>
): Promise<{ success: boolean; data?: VanBanDen; message?: string }> {
  const currentListRes = await getVanBanDenList();
  const list = currentListRes.data;

  // Kiểm tra trùng số đến trong cùng một năm
  const isDuplicate = list.some(
    (item) => Number(item.nam) === Number(docData.nam) && Number(item.so_den) === Number(docData.so_den)
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đến ${docData.so_den} đã tồn tại trong năm ${docData.nam}. Vui lòng kiểm tra lại.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newDoc: VanBanDen = {
    ...docData,
    id: generateDocumentId('VBD', docData.nam),
    ngay_tao: nowIso,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDen.unshift(newDoc);
    return { success: true, data: newDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const rowValues = vanBanDenToRow(newDoc);

    await sheets.spreadsheets.values.append({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A2:U',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: newDoc };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi thêm văn bản đến:', error);
    return {
      success: false,
      message: error?.message || 'Không thể ghi dữ liệu vào Google Sheets. Vui lòng kiểm tra quyền chia sẻ.',
    };
  }
}

/**
 * Cập nhật một văn bản đến
 */
export async function updateVanBanDen(
  id: string,
  docData: Partial<VanBanDen>
): Promise<{ success: boolean; data?: VanBanDen; message?: string }> {
  const currentListRes = await getVanBanDenList();
  const list = currentListRes.data;
  const existingIndex = list.findIndex((d) => d.id === id);

  if (existingIndex === -1) {
    return { success: false, message: 'Không tìm thấy văn bản đến cần sửa.' };
  }

  const existing = list[existingIndex];

  // Kiểm tra trùng số đến nếu thay đổi số đến hoặc năm
  const targetNam = docData.nam !== undefined ? Number(docData.nam) : Number(existing.nam);
  const targetSoDen = docData.so_den !== undefined ? Number(docData.so_den) : Number(existing.so_den);

  const isDuplicate = list.some(
    (item) => item.id !== id && Number(item.nam) === targetNam && Number(item.so_den) === targetSoDen
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đến ${targetSoDen} đã tồn tại trong năm ${targetNam}.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedDoc: VanBanDen = {
    ...existing,
    ...docData,
    id: existing.id, // Đảm bảo ID không thay đổi
    nam: targetNam,
    so_den: targetSoDen,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDen = inMemoryVanBanDen.map((d) => (d.id === id ? updatedDoc : d));
    return { success: true, data: updatedDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    // Đọc cột A để xác định chính xác số thứ tự dòng chứa ID
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1; // Chỉ số 1-indexed trong Sheets
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy dòng tương ứng trên Google Sheets.' };
    }

    const rowValues = vanBanDenToRow(updatedDoc);
    await sheets.spreadsheets.values.update({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DEN!A${targetRowIndex}:U${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: updatedDoc };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi cập nhật văn bản đến:', error);
    return { success: false, message: error?.message || 'Lỗi khi cập nhật Google Sheets.' };
  }
}

/**
 * Xóa một văn bản đến
 */
export async function deleteVanBanDen(id: string): Promise<{ success: boolean; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    inMemoryVanBanDen = inMemoryVanBanDen.filter((d) => d.id !== id);
    return { success: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      // Nếu không tìm thấy trên sheets, xóa trong bộ nhớ tạm nếu có
      inMemoryVanBanDen = inMemoryVanBanDen.filter((d) => d.id !== id);
      return { success: true };
    }

    // Xóa nội dung dòng bằng clear để an toàn tuyệt đối
    await sheets.spreadsheets.values.clear({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DEN!A${targetRowIndex}:U${targetRowIndex}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi xóa văn bản đến:', error);
    inMemoryVanBanDen = inMemoryVanBanDen.filter((d) => d.id !== id);
    return { success: true };
  }
}

// ==============================================================================
// 2. QUẢN LÝ VĂN BẢN ĐI (Sheet: VAN_BAN_DI - 18 cột)
// ==============================================================================

function rowToVanBanDi(row: any[]): VanBanDi {
  return {
    id: String(row[0] || ''),
    nam: Number(row[1]) || new Date().getFullYear(),
    so_di: Number(row[2]) || 0,
    ngay_phat_hanh: String(row[3] || ''),
    so_ky_hieu: String(row[4] || ''),
    ngay_ky: String(row[5] || ''),
    loai_van_ban: String(row[7 - 1] || ''),
    trich_yeu: String(row[8 - 1] || ''),
    don_vi_soan_thao: String(row[9 - 1] || ''),
    nguoi_ky: String(row[10 - 1] || ''),
    chuc_vu_nguoi_ky: String(row[11 - 1] || ''),
    noi_nhan: String(row[12 - 1] || ''),
    hinh_thuc_gui: String(row[13 - 1] || ''),
    trang_thai: (row[14 - 1] || 'Đã phát hành') as any,
    link_dinh_kem: String(row[15 - 1] || ''),
    ghi_chu: String(row[16 - 1] || ''),
    ngay_tao: String(row[17 - 1] || ''),
    ngay_cap_nhat: String(row[18 - 1] || ''),
  };
}

function vanBanDiToRow(doc: VanBanDi): any[] {
  return [
    doc.id,
    doc.nam,
    doc.so_di,
    doc.ngay_phat_hanh,
    doc.so_ky_hieu,
    doc.ngay_ky,
    doc.loai_van_ban,
    doc.trich_yeu,
    doc.don_vi_soan_thao,
    doc.nguoi_ky,
    doc.chuc_vu_nguoi_ky,
    doc.noi_nhan,
    doc.hinh_thuc_gui,
    doc.trang_thai,
    doc.link_dinh_kem,
    doc.ghi_chu,
    doc.ngay_tao,
    doc.ngay_cap_nhat,
  ];
}

export async function getVanBanDiList(): Promise<{ data: VanBanDi[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryVanBanDi, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A2:R',
    });

    const rows = res.data.values || [];
    const list: VanBanDi[] = rows
      .filter((r) => r && r[0])
      .map(rowToVanBanDi);

    return { data: list, isDemo: false };
  } catch (error) {
    console.warn('[DocFlow Sheets API] Lỗi kết nối Google Sheets (VAN_BAN_DI), chuyển sang chế độ Demo:', error);
    return { data: inMemoryVanBanDi, isDemo: true };
  }
}

export async function addVanBanDi(
  docData: Omit<VanBanDi, 'id' | 'ngay_tao' | 'ngay_cap_nhat'>
): Promise<{ success: boolean; data?: VanBanDi; message?: string }> {
  const currentListRes = await getVanBanDiList();
  const list = currentListRes.data;

  // Kiểm tra trùng số đi trong cùng một năm
  const isDuplicate = list.some(
    (item) => Number(item.nam) === Number(docData.nam) && Number(item.so_di) === Number(docData.so_di)
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đi ${docData.so_di} đã tồn tại trong năm ${docData.nam}. Vui lòng kiểm tra lại.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newDoc: VanBanDi = {
    ...docData,
    id: generateDocumentId('VBDI', docData.nam),
    ngay_tao: nowIso,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDi.unshift(newDoc);
    return { success: true, data: newDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const rowValues = vanBanDiToRow(newDoc);

    await sheets.spreadsheets.values.append({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A2:R',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: newDoc };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi thêm văn bản đi:', error);
    return {
      success: false,
      message: error?.message || 'Không thể ghi dữ liệu vào Google Sheets.',
    };
  }
}

export async function updateVanBanDi(
  id: string,
  docData: Partial<VanBanDi>
): Promise<{ success: boolean; data?: VanBanDi; message?: string }> {
  const currentListRes = await getVanBanDiList();
  const list = currentListRes.data;
  const existingIndex = list.findIndex((d) => d.id === id);

  if (existingIndex === -1) {
    return { success: false, message: 'Không tìm thấy văn bản đi cần sửa.' };
  }

  const existing = list[existingIndex];

  const targetNam = docData.nam !== undefined ? Number(docData.nam) : Number(existing.nam);
  const targetSoDi = docData.so_di !== undefined ? Number(docData.so_di) : Number(existing.so_di);

  const isDuplicate = list.some(
    (item) => item.id !== id && Number(item.nam) === targetNam && Number(item.so_di) === targetSoDi
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đi ${targetSoDi} đã tồn tại trong năm ${targetNam}.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedDoc: VanBanDi = {
    ...existing,
    ...docData,
    id: existing.id,
    nam: targetNam,
    so_di: targetSoDi,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDi = inMemoryVanBanDi.map((d) => (d.id === id ? updatedDoc : d));
    return { success: true, data: updatedDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy dòng tương ứng trên Google Sheets.' };
    }

    const rowValues = vanBanDiToRow(updatedDoc);
    await sheets.spreadsheets.values.update({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DI!A${targetRowIndex}:R${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: updatedDoc };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi cập nhật văn bản đi:', error);
    return { success: false, message: error?.message || 'Lỗi khi cập nhật Google Sheets.' };
  }
}

export async function deleteVanBanDi(id: string): Promise<{ success: boolean; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    inMemoryVanBanDi = inMemoryVanBanDi.filter((d) => d.id !== id);
    return { success: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      inMemoryVanBanDi = inMemoryVanBanDi.filter((d) => d.id !== id);
      return { success: true };
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DI!A${targetRowIndex}:R${targetRowIndex}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi khi xóa văn bản đi:', error);
    inMemoryVanBanDi = inMemoryVanBanDi.filter((d) => d.id !== id);
    return { success: true };
  }
}

// ==============================================================================
// 3. FILE DOCFLOW_SYSTEM (DANH_MUC, THONG_KE, CAU_HINH)
// ==============================================================================

export async function getDanhMucList(): Promise<{ data: DanhMucItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryDanhMuc, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'DANH_MUC!A2:D',
    });

    const rows = res.data.values || [];
    const list: DanhMucItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        nhom_danh_muc: String(r[0] || ''),
        ma: String(r[1] || ''),
        ten_gia_tri: String(r[2] || ''),
        ghi_chu: String(r[3] || ''),
      }));

    return { data: list.length > 0 ? list : inMemoryDanhMuc, isDemo: false };
  } catch (error) {
    console.warn('[DocFlow Sheets API] Lỗi đọc DANH_MUC, dùng dữ liệu dự phòng:', error);
    return { data: inMemoryDanhMuc, isDemo: true };
  }
}

export async function updateDanhMucItem(
  original: Pick<DanhMucItem, 'nhom_danh_muc' | 'ma'>,
  updates: DanhMucItem
): Promise<{ success: boolean; data?: DanhMucItem; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    const index = inMemoryDanhMuc.findIndex(
      (item) => item.nhom_danh_muc === original.nhom_danh_muc && item.ma === original.ma
    );

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy danh mục cần cập nhật.' };
    }

    inMemoryDanhMuc[index] = updates;
    return { success: true, data: updates };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'DANH_MUC!A2:D',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => String(row[0] || '') === original.nhom_danh_muc && String(row[1] || '') === original.ma
    );

    if (rowIndex === -1) {
      return { success: false, message: 'Không tìm thấy danh mục cần cập nhật trên Google Sheets.' };
    }

    const duplicate = rows.some(
      (row, index) =>
        index !== rowIndex &&
        String(row[0] || '') === updates.nhom_danh_muc &&
        String(row[1] || '') === updates.ma
    );
    if (duplicate) {
      return { success: false, message: 'Mã danh mục đã tồn tại trong nhóm này.' };
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SYSTEM_ID,
      range: `DANH_MUC!A${rowIndex + 2}:D${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updates.nhom_danh_muc, updates.ma, updates.ten_gia_tri, updates.ghi_chu]],
      },
    });

    return { success: true, data: updates };
  } catch (error: any) {
    console.error('[DocFlow Sheets API] Lỗi cập nhật DANH_MUC:', error);
    return {
      success: false,
      message: error?.message || 'Không thể cập nhật danh mục trên Google Sheets.',
    };
  }
}

export async function getThongKeSystemList(): Promise<{ data: ThongKeItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryThongKe, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'THONG_KE!A2:C',
    });

    const rows = res.data.values || [];
    const list: ThongKeItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        chi_so: String(r[0] || ''),
        gia_tri: String(r[1] || ''),
        ghi_chu: String(r[2] || ''),
      }));

    return { data: list.length > 0 ? list : inMemoryThongKe, isDemo: false };
  } catch {
    return { data: inMemoryThongKe, isDemo: true };
  }
}

export async function getCauHinhList(): Promise<{ data: CauHinhItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryCauHinh, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'CAU_HINH!A2:C',
    });

    const rows = res.data.values || [];
    const list: CauHinhItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        tham_so: String(r[0] || ''),
        gia_tri: String(r[1] || ''),
        ghi_chu: String(r[2] || ''),
      }));

    return { data: list.length > 0 ? list : inMemoryCauHinh, isDemo: false };
  } catch {
    return { data: inMemoryCauHinh, isDemo: true };
  }
}

// ==============================================================================
// 4. TÍNH TOÁN THỐNG KÊ DASHBOARD
// ==============================================================================

export async function getDashboardData(selectedYear?: number): Promise<{
  stats: DashboardStats;
  isDemo: boolean;
}> {
  const [denRes, diRes] = await Promise.all([getVanBanDenList(), getVanBanDiList()]);
  const isDemo = denRes.isDemo || diRes.isDemo;

  let denList = denRes.data;
  let diList = diRes.data;

  if (selectedYear) {
    denList = denList.filter((d) => Number(d.nam) === Number(selectedYear));
    diList = diList.filter((d) => Number(d.nam) === Number(selectedYear));
  }

  let chuaXuLy = 0;
  let dangXuLy = 0;
  let daHoanThanh = 0;
  let quaHan = 0;
  let canXuLyGap = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  denList.forEach((d) => {
    if (d.trang_thai === 'Đã hoàn thành') {
      daHoanThanh++;
    } else if (d.trang_thai === 'Đang xử lý') {
      dangXuLy++;
    } else if (d.trang_thai === 'Quá hạn') {
      quaHan++;
    } else {
      chuaXuLy++;
    }

    // Kiểm tra quá hạn hoặc hạn gần nếu chưa hoàn thành
    if (d.trang_thai !== 'Đã hoàn thành' && d.han_xu_ly) {
      if (d.han_xu_ly < todayStr) {
        // Quá hạn
      } else if (d.muc_do_uu_tien === 'Khẩn' || d.muc_do_uu_tien === 'Hỏa tốc' || d.muc_do_uu_tien === 'Thượng khẩn') {
        canXuLyGap++;
      }
    }
  });

  // Thống kê 12 tháng
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthStr = String(month).padStart(2, '0');

    const countDen = denList.filter((d) => {
      const dMonth = (d.ngay_den || '').split('-')[1];
      return dMonth === monthStr;
    }).length;

    const countDi = diList.filter((d) => {
      const dMonth = (d.ngay_phat_hanh || '').split('-')[1];
      return dMonth === monthStr;
    }).length;

    return {
      thang: month,
      ten_thang: `T${month}`,
      van_ban_den: countDen,
      van_ban_di: countDi,
    };
  });

  return {
    stats: {
      tong_den: denList.length,
      tong_di: diList.length,
      chua_xu_ly: chuaXuLy,
      dang_xu_ly: dangXuLy,
      da_hoan_thanh: daHoanThanh,
      qua_han: quaHan,
      can_xu_ly_gap: canXuLyGap,
      thong_ke_thang: monthlyStats,
      van_ban_den_moi_nhat: denList.slice(0, 5),
      van_ban_di_moi_nhat: diList.slice(0, 5),
    },
    isDemo,
  };
}

// ==============================================================================
// 5. KIỂM TRA KẾT NỐI HỆ THỐNG
// ==============================================================================

export async function testGoogleConnection(): Promise<{
  databaseConnected: boolean;
  systemConnected: boolean;
  clientEmailConfigured: boolean;
  privateKeyConfigured: boolean;
  databaseId: string;
  systemId: string;
  error?: string;
}> {
  const clientEmailConfigured = !!process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyConfigured = !!process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmailConfigured || !privateKeyConfigured) {
    return {
      databaseConnected: false,
      systemConnected: false,
      clientEmailConfigured,
      privateKeyConfigured,
      databaseId: DATABASE_ID,
      systemId: SYSTEM_ID,
      error: 'Chưa cấu hình GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY trong biến môi trường.',
    };
  }

  let dbOk = false;
  let sysOk = false;
  let errMsg = '';

  try {
    const sheets = getGoogleSheetsClient();
    // Test database sheet
    await sheets.spreadsheets.get({
      spreadsheetId: DATABASE_ID,
      fields: 'sheets.properties.title',
    });
    dbOk = true;

    // Test system sheet
    await sheets.spreadsheets.get({
      spreadsheetId: SYSTEM_ID,
      fields: 'sheets.properties.title',
    });
    sysOk = true;
  } catch (err: any) {
    errMsg = err?.message || 'Lỗi khi gọi Google Sheets API';
  }

  return {
    databaseConnected: dbOk,
    systemConnected: sysOk,
    clientEmailConfigured,
    privateKeyConfigured,
    databaseId: DATABASE_ID,
    systemId: SYSTEM_ID,
    error: errMsg || undefined,
  };
}
