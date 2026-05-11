USE DORM
GO

/* =========================================================
   DATA TỐI THIỂU ĐỂ TEST SP + UI
========================================================= */

/* =========================================================
   1. CHÍNH SÁCH
========================================================= */

INSERT INTO CHINH_SACH_THUE
(
    MA_DIEU_KHOAN,
    TEN_DIEU_KHOAN,
    NOI_DUNG
)
VALUES
(
    'DK001',
    N'Nội quy cơ bản',
    N'Không gây ồn'
);
GO

/* =========================================================
   2. KTX
========================================================= */

INSERT INTO KY_TUC_XA
(
    MA_KTX,
    TEN_KTX,
    DIA_CHI,
    QUY_DINH,
    MA_DIEU_KHOAN,
    GIA_DIEN,
    GIA_NUOC,
    WIFI,
    GUI_XE,
    DICH_VU
)
VALUES
(
    'KTX001',
    N'KTX A',
    N'Quận 1',
    N'Không hút thuốc',
    'DK001',
    3500,
    15000,
    N'Có',
    100000,
    200000
);
GO

/* =========================================================
   3. PHÒNG
========================================================= */

INSERT INTO PHONG
(
    MA_KTX,
    MA_PHONG,
    IMAGE_URL,
    SL_GIUONG,
    SL_GIUONG_TRONG,
    TRANG_THAI,
    SO_DIEN_CU,
    SO_DIEN_MOI,
    MO_TA
)
VALUES
(
    'KTX001',
    'P101',
    'room.jpg',
    4,
    2,
    N'Trống',
    100,
    120,
    N'Phòng máy lạnh'
);
GO

/* =========================================================
   4. GIƯỜNG
========================================================= */

INSERT INTO GIUONG
(
    MA_KTX,
    MA_PHONG,
    MA_GIUONG,
    TRANG_THAI,
    GIA
)
VALUES
('KTX001', 'P101', 'G101', N'Trống', 1500000),
('KTX001', 'P101', 'G102', N'Đã thuê', 1500000),
('KTX001', 'P101', 'G103', N'Trống', 1500000);
GO

/* =========================================================
   5. HỢP ĐỒNG
========================================================= */

INSERT INTO HOP_DONG_THUE
(
    MA_HOP_DONG,
    NGAY_BD,
    NGAY_KT,
    SL_NGUOI_THUE,
    NOI_DUNG,
    TRANG_THAI,
    MA_PHIEU,
    IMAGE_URL
)
VALUES
(
    'HD001',
    CAST(GETDATE() AS DATE),
    DATEADD(MONTH, 6, GETDATE()),
    1,
    N'Hợp đồng thuê',
    N'Đã ký',
    NULL,
    'contract.jpg'
);
GO

/* =========================================================
   6. TÀI KHOẢN
========================================================= */

INSERT INTO TAI_KHOAN
(
    MA_TK,
    MAT_KHAU,
    EMAIL,
    ROLE,
    MA_HOP_DONG
)
VALUES
(
    'TK001',
    '123',
    'sale@gmail.com',
    'SALE',
    NULL
),
(
    'TK002',
    '123',
    'customer@gmail.com',
    'CUSTOMER',
    'HD001'
);
GO

/* =========================================================
   7. NHÂN VIÊN
========================================================= */

INSERT INTO NHAN_VIEN
(
    MA_NV,
    TEN_NV,
    NGAY_SINH,
    NGAY_BD_LAM,
    CCCD,
    SDT,
    MA_TK,
    GIOI_TINH,
    CHUC_VU
)
VALUES
(
    'NV001',
    N'Nguyễn Văn A',
    '1999-01-01',
    '2024-01-01',
    '123456789111',
    '0901111111',
    'TK001',
    N'Nam',
    N'Sale'
);
GO

/* =========================================================
   8. KHÁCH HÀNG
========================================================= */

INSERT INTO KHACH_HANG
(
    MA_KH,
    TEN_KH,
    NGAY_SINH,
    CCCD,
    SDT,
    GIOI_TINH,
    MA_TK
)
VALUES
(
    'KH001',
    N'Lê Văn B',
    '2003-05-01',
    '123456789222',
    '0911111111',
    N'Nam',
    'TK002'
);
GO

/* =========================================================
   9. PHIẾU ĐĂNG KÝ
========================================================= */

INSERT INTO PHIEU_DANG_KY_THUE
(
    MA_PDK,
    NGAY_DANG_KY,
    MA_KH,
    HINH_THUC_THUE
)
VALUES
(
    'PDK001',
    CAST(GETDATE() AS DATE),
    'KH001',
    N'Cá nhân'
);
GO

/* =========================================================
   10. PHIẾU ĐẶT CỌC
========================================================= */

INSERT INTO PHIEU_DAT_COC
(
    MA_PDC,
    NGAY,
    SO_TIEN,
    TRANG_THAI,
    MA_KH,
    MA_NV
)
VALUES
(
    'PDC001',
    GETDATE(),
    2000000,
    N'Đã đặt cọc',
    'KH001',
    'NV001'
);
GO

/* =========================================================
   11. LỊCH
   PHẢI CÓ "Nhận phòng"
========================================================= */

INSERT INTO LICH
(
    MA_PHIEU,
    NGAY_GIO,
    LOAI,
    TRANG_THAI,
    MA_PDK,
    MA_PDC,
    MA_KTX,
    MA_PHONG,
    MA_NV
)
VALUES
(
    'LICH001',
    GETDATE(),
    N'Nhận phòng',
    N'Đã xử lý',
    'PDK001',
    'PDC001',
    'KTX001',
    'P101',
    'NV001'
);
GO

/* =========================================================
   12. UPDATE HỢP ĐỒNG -> LỊCH
========================================================= */

UPDATE HOP_DONG_THUE
SET MA_PHIEU = 'LICH001'
WHERE MA_HOP_DONG = 'HD001';
GO

/* =========================================================
   13. LỊCH GIƯỜNG
========================================================= */

INSERT INTO LICH_GIUONG
(
    MA_PHIEU,
    MA_GIUONG
)
VALUES
(
    'LICH001',
    'G101'
);
GO

/* =========================================================
   14. BIÊN BẢN BÀN GIAO
========================================================= */

INSERT INTO BIEN_BAN_BAN_GIAO
(
    MA_BAN_GIAO,
    NGAY,
    MA_HOP_DONG,
    MA_NV,
    IMAGE_URL
)
VALUES
(
    'BB001',
    CAST(GETDATE() AS DATE),
    'HD001',
    'NV001',
    'handover.jpg'
);
GO

/* =========================================================
   TEST
========================================================= */

SELECT * FROM LICH;
SELECT * FROM TAI_KHOAN;
SELECT * FROM HOP_DONG_THUE;
SELECT * FROM BIEN_BAN_BAN_GIAO;

/* =========================================================
   THÊM 2 LỊCH CHƯA BÀN GIAO
========================================================= */

/* ---------- HỢP ĐỒNG 2 ---------- */

INSERT INTO HOP_DONG_THUE
(
    MA_HOP_DONG,
    NGAY_BD,
    NGAY_KT,
    SL_NGUOI_THUE,
    NOI_DUNG,
    TRANG_THAI,
    MA_PHIEU,
    IMAGE_URL
)
VALUES
(
    'HD002',
    CAST(GETDATE() AS DATE),
    DATEADD(MONTH, 12, GETDATE()),
    1,
    N'Hợp đồng thuê phòng 2',
    N'Đã ký',
    NULL,
    'contract2.jpg'
);
GO

/* ---------- TÀI KHOẢN + KHÁCH HÀNG 2 ---------- */

INSERT INTO TAI_KHOAN
(
    MA_TK,
    MAT_KHAU,
    EMAIL,
    ROLE,
    MA_HOP_DONG
)
VALUES
(
    'TK003',
    '123',
    'customer2@gmail.com',
    'CUSTOMER',
    'HD002'
);
GO

INSERT INTO KHACH_HANG
(
    MA_KH,
    TEN_KH,
    NGAY_SINH,
    CCCD,
    SDT,
    GIOI_TINH,
    MA_TK
)
VALUES
(
    'KH002',
    N'Trần Văn C',
    '2002-02-02',
    '123456789333',
    '0922222222',
    N'Nam',
    'TK003'
);
GO

/* ---------- PHIẾU + LỊCH 2 ---------- */

INSERT INTO PHIEU_DANG_KY_THUE
(
    MA_PDK,
    NGAY_DANG_KY,
    MA_KH,
    HINH_THUC_THUE
)
VALUES
(
    'PDK002',
    CAST(GETDATE() AS DATE),
    'KH002',
    N'Cá nhân'
);
GO

INSERT INTO PHIEU_DAT_COC
(
    MA_PDC,
    NGAY,
    SO_TIEN,
    TRANG_THAI,
    MA_KH,
    MA_NV
)
VALUES
(
    'PDC002',
    GETDATE(),
    2000000,
    N'Đã đặt cọc',
    'KH002',
    'NV001'
);
GO

INSERT INTO LICH
(
    MA_PHIEU,
    NGAY_GIO,
    LOAI,
    TRANG_THAI,
    MA_PDK,
    MA_PDC,
    MA_KTX,
    MA_PHONG,
    MA_NV
)
VALUES
(
    'LICH002',
    DATEADD(DAY, 1, GETDATE()),
    N'Nhận phòng',
    N'Đã xử lý',
    'PDK002',
    'PDC002',
    'KTX001',
    'P101',
    'NV001'
);
GO

UPDATE HOP_DONG_THUE
SET MA_PHIEU = 'LICH002'
WHERE MA_HOP_DONG = 'HD002';
GO

INSERT INTO LICH_GIUONG
(
    MA_PHIEU,
    MA_GIUONG
)
VALUES
(
    'LICH002',
    'G103'
);
GO

/* =========================================================
   HỢP ĐỒNG 3
========================================================= */

INSERT INTO HOP_DONG_THUE
(
    MA_HOP_DONG,
    NGAY_BD,
    NGAY_KT,
    SL_NGUOI_THUE,
    NOI_DUNG,
    TRANG_THAI,
    MA_PHIEU,
    IMAGE_URL
)
VALUES
(
    'HD003',
    CAST(GETDATE() AS DATE),
    DATEADD(MONTH, 6, GETDATE()),
    1,
    N'Hợp đồng thuê phòng 3',
    N'Đã ký',
    NULL,
    'contract3.jpg'
);
GO

INSERT INTO TAI_KHOAN
(
    MA_TK,
    MAT_KHAU,
    EMAIL,
    ROLE,
    MA_HOP_DONG
)
VALUES
(
    'TK004',
    '123',
    'customer3@gmail.com',
    'CUSTOMER',
    'HD003'
);
GO

INSERT INTO KHACH_HANG
(
    MA_KH,
    TEN_KH,
    NGAY_SINH,
    CCCD,
    SDT,
    GIOI_TINH,
    MA_TK
)
VALUES
(
    'KH003',
    N'Phạm Thị D',
    '2004-03-03',
    '123456789444',
    '0933333333',
    N'Nữ',
    'TK004'
);
GO

INSERT INTO PHIEU_DANG_KY_THUE
(
    MA_PDK,
    NGAY_DANG_KY,
    MA_KH,
    HINH_THUC_THUE
)
VALUES
(
    'PDK003',
    CAST(GETDATE() AS DATE),
    'KH003',
    N'Cá nhân'
);
GO

INSERT INTO PHIEU_DAT_COC
(
    MA_PDC,
    NGAY,
    SO_TIEN,
    TRANG_THAI,
    MA_KH,
    MA_NV
)
VALUES
(
    'PDC003',
    GETDATE(),
    2500000,
    N'Đã đặt cọc',
    'KH003',
    'NV001'
);
GO

INSERT INTO LICH
(
    MA_PHIEU,
    NGAY_GIO,
    LOAI,
    TRANG_THAI,
    MA_PDK,
    MA_PDC,
    MA_KTX,
    MA_PHONG,
    MA_NV
)
VALUES
(
    'LICH003',
    DATEADD(DAY, 2, GETDATE()),
    N'Nhận phòng',
    N'Đã xử lý',
    'PDK003',
    'PDC003',
    'KTX001',
    'P101',
    'NV001'
);
GO

UPDATE HOP_DONG_THUE
SET MA_PHIEU = 'LICH003'
WHERE MA_HOP_DONG = 'HD003';
GO

/* =========================================================
   CHECK
========================================================= */

SELECT 
    HD.MA_HOP_DONG,
    HD.MA_PHIEU,
    BB.MA_BAN_GIAO
FROM HOP_DONG_THUE HD
LEFT JOIN BIEN_BAN_BAN_GIAO BB
    ON HD.MA_HOP_DONG = BB.MA_HOP_DONG;
GO