USE DORM
GO

/* =========================================================
   SAMPLE DATA
========================================================= */

/* =========================================================
   1. CHINH_SACH_THUE
========================================================= */

INSERT INTO CHINH_SACH_THUE VALUES
('DK001', N'Không gây ồn', N'Không gây ồn sau 22h'),
('DK002', N'Không nuôi thú cưng', N'Cấm nuôi chó mèo'),
('DK003', N'Đóng tiền đúng hạn', N'Đóng trước ngày 5 hàng tháng');

/* =========================================================
   2. KY_TUC_XA
========================================================= */

INSERT INTO KY_TUC_XA VALUES
('KTX001', N'KTX Quận 7', N'123 Nguyễn Văn Linh', N'Nội quy cơ bản',
 'DK001', 3500, 15000, N'Có', 100000, 200000),

('KTX002', N'KTX Thủ Đức', N'456 Võ Văn Ngân', N'Nội quy nghiêm',
 'DK002', 4000, 16000, N'Có', 120000, 250000);

/* =========================================================
   3. PHONG
========================================================= */

INSERT INTO PHONG VALUES
('KTX001', 'P101', 'room1.jpg', 4, 2, N'Trống',
 100, 150, N'Phòng máy lạnh'),

('KTX001', 'P102', 'room2.jpg', 6, 1, N'Đã thuê',
 200, 260, N'Phòng thường'),

('KTX002', 'P201', 'room3.jpg', 4, 4, N'Trống',
 120, 140, N'View đẹp');

/* =========================================================
   4. GIUONG
========================================================= */

INSERT INTO GIUONG VALUES
('KTX001','P101','G1',N'Đã thuê',1500000),
('KTX001','P101','G2',N'Trống',1500000),
('KTX001','P101','G3',N'Trống',1500000),
('KTX001','P101','G4',N'Đã thuê',1500000),

('KTX001','P102','G1',N'Đã thuê',1200000),
('KTX001','P102','G2',N'Đã thuê',1200000),

('KTX002','P201','G1',N'Trống',1800000),
('KTX002','P201','G2',N'Trống',1800000);

/* =========================================================
   5. HOP_DONG_THUE
========================================================= */

INSERT INTO HOP_DONG_THUE
(MA_HOP_DONG, NGAY_BD, NGAY_KT, SL_NGUOI_THUE,
 NOI_DUNG, TRANG_THAI, MA_PHIEU, IMAGE_URL)
VALUES
('HD001', '2026-05-01', '2026-12-01', 2,
 N'Hợp đồng thuê phòng 101',
 N'Đã ký', NULL, 'hd1.jpg'),

('HD002', '2026-05-02', '2026-11-02', 1,
 N'Hợp đồng thuê phòng 102',
 N'Chưa ký', NULL, 'hd2.jpg');

/* =========================================================
   6. TAI_KHOAN
========================================================= */

INSERT INTO TAI_KHOAN VALUES
('TK001', '123456', 'sale1@gmail.com', 'SALE', NULL),
('TK002', '123456', 'manager@gmail.com', 'BRANCH_MANAGER', NULL),
('TK003', '123456', 'kh1@gmail.com', 'CUSTOMER', 'HD001'),
('TK004', '123456', 'kh2@gmail.com', 'CUSTOMER', 'HD002');

/* =========================================================
   7. NHAN_VIEN
========================================================= */

INSERT INTO NHAN_VIEN VALUES
('NV001', N'Nguyễn Văn A',
 '1998-05-01', '2023-01-01',
 '123456789001', '0901111111',
 'TK001', N'Nam', N'Sale'),

('NV002', N'Trần Thị B',
 '1995-02-10', '2022-05-01',
 '123456789002', '0902222222',
 'TK002', N'Nữ', N'Quản lý');

/* =========================================================
   8. KHACH_HANG
========================================================= */

INSERT INTO KHACH_HANG VALUES
('KH001', N'Lê Minh C',
 '2003-08-01',
 '123456789101', '0911111111',
 N'Nam', 'TK003'),

('KH002', N'Phạm Thị D',
 '2002-03-11',
 '123456789102', '0922222222',
 N'Nữ', 'TK004');

/* =========================================================
   9. PHIEU_DANG_KY_THUE
========================================================= */

INSERT INTO PHIEU_DANG_KY_THUE VALUES
('PDK01', '2026-05-01', 'NV001', 'KH001', N'Cá nhân'),
('PDK02', '2026-05-02', 'NV001', 'KH002', N'Nhóm');

/* =========================================================
   10. PHIEU_DAT_COC
========================================================= */

INSERT INTO PHIEU_DAT_COC VALUES
('PDC01', GETDATE(), 2000000,
 N'Đã đặt cọc', 'KH001', 'NV001'),

('PDC02', GETDATE(), 1500000,
 N'Chưa đặt cọc', 'KH002', 'NV001');

/* =========================================================
   11. LICH
========================================================= */

INSERT INTO LICH VALUES
('LICH0001',
 DATEADD(DAY, 1, GETDATE()),
 N'Xem phòng',
 N'Chưa xử lý',
 'PDK01',
 NULL,
 'KTX001',
 'P101',
 'NV001'),

('LICH0002',
 DATEADD(DAY, 2, GETDATE()),
 N'Nhận phòng',
 N'Đã xử lý',
 NULL,
 'PDC01',
 'KTX001',
 'P102',
 'NV002');

/* =========================================================
   12. UPDATE HỢP ĐỒNG THÊM MA_PHIEU
========================================================= */

UPDATE HOP_DONG_THUE
SET MA_PHIEU = 'LICH0001'
WHERE MA_HOP_DONG = 'HD001';

UPDATE HOP_DONG_THUE
SET MA_PHIEU = 'LICH0002'
WHERE MA_HOP_DONG = 'HD002';

/* =========================================================
   13. LICH_GIUONG
========================================================= */

INSERT INTO LICH_GIUONG VALUES
('LICH0001', 'G2'),
('LICH0001', 'G3'),
('LICH0002', 'G1');

/* =========================================================
   14. BIEN_BAN_BAN_GIAO
========================================================= */

INSERT INTO BIEN_BAN_BAN_GIAO VALUES
('BB001', '2026-05-03',
 'HD001', 'NV002',
 'bbbg1.jpg'),

('BB002', '2026-05-04',
 'HD002', 'NV002',
 'bbbg2.jpg');

/* =========================================================
   15. BB_BG_CHI_TIET
========================================================= */

INSERT INTO BB_BG_CHI_TIET VALUES
('VT001', N'Bóng đèn', 2, 200000, 'BB001'),
('VT002', N'Bàn học', 1, 500000, 'BB001'),
('VT003', N'Quạt máy', 1, 700000, 'BB002');

/* =========================================================
   16. PHIEU_THANH_TOAN
========================================================= */

INSERT INTO PHIEU_THANH_TOAN VALUES
('TT001', N'QR',
 '2026-05-05',
 3000000,
 N'Đã thanh toán',
 'HD001',
 NULL),

('TT002', N'Tiền mặt',
 '2026-05-06',
 1500000,
 N'Chưa thanh toán',
 NULL,
 'PDC01');

/* =========================================================
   17. BIEN_BAN_TRA_PHONG
========================================================= */

INSERT INTO BIEN_BAN_TRA_PHONG VALUES
('TP001',
 '2026-05-07',
 N'Phòng sạch sẽ',
 'NV002',
 'TT001',
 'HD001',
 N'Đã xử lí'),

('TP002',
 '2026-05-08',
 N'Chờ kiểm tra thiết bị',
 'NV001',
 'TT002',
 'HD002',
 N'Đang chờ xử lí');


 /* =========================================================
   THÊM LỊCH CHƯA KÝ HỢP ĐỒNG
   (chỉ xem phòng / đặt cọc, chưa tạo hợp đồng)
========================================================= */

/* --- Phiếu đăng ký mới --- */
INSERT INTO PHIEU_DANG_KY_THUE VALUES
('PDK03', '2026-05-09', 'NV001', 'KH001', N'Cá nhân'),

('PDK04', '2026-05-10', 'NV001', 'KH002', N'Nhóm');

/* --- Phiếu đặt cọc mới --- */
INSERT INTO PHIEU_DAT_COC VALUES
('PDC03', GETDATE(), 2500000,
 N'Đã đặt cọc', 'KH001', 'NV001'),

('PDC04', GETDATE(), 1800000,
 N'Chưa đặt cọc', 'KH002', 'NV001');

/* =========================================================
   LỊCH CHƯA KÝ HỢP ĐỒNG
   -> KHÔNG có bản ghi trong HOP_DONG_THUE
========================================================= */

INSERT INTO LICH VALUES
(
    'LICH0003',
    DATEADD(DAY, 3, GETDATE()),
    N'Xem phòng',
    N'Chưa xử lý',
    'PDK03',
    NULL,
    'KTX002',
    'P201',
    'NV001'
),

(
    'LICH0004',
    DATEADD(DAY, 4, GETDATE()),
    N'Nhận phòng',
    N'Chưa xử lý',
    NULL,
    'PDC03',
    'KTX001',
    'P101',
    'NV002'
),

(
    'LICH0005',
    DATEADD(DAY, 5, GETDATE()),
    N'Xem phòng',
    N'Chưa xử lý',
    'PDK04',
    NULL,
    'KTX001',
    'P102',
    'NV001'
),

(
    'LICH0006',
    DATEADD(DAY, 6, GETDATE()),
    N'Nhận phòng',
    N'Chưa xử lý',
    NULL,
    'PDC04',
    'KTX002',
    'P201',
    'NV002'
);

/* =========================================================
   GIƯỜNG CHO CÁC LỊCH
========================================================= */

INSERT INTO LICH_GIUONG VALUES
('LICH0003', 'G1'),
('LICH0004', 'G2'),
('LICH0005', 'G1'),
('LICH0006', 'G2');

/* =========================================================
   KIỂM TRA:
   Các lịch này chưa có hợp đồng
========================================================= */

SELECT l.*
FROM LICH l
LEFT JOIN HOP_DONG_THUE h
    ON l.MA_PHIEU = h.MA_PHIEU
WHERE h.MA_HOP_DONG IS NULL;
/* =========================================================
   THÊM LỊCH ĐÃ XỬ LÝ
   (đã xử lý nhưng chưa ký hợp đồng)
========================================================= */

/* --- Phiếu đăng ký --- */
INSERT INTO PHIEU_DANG_KY_THUE VALUES
('PDK05', '2026-05-11', 'NV002', 'KH001', N'Cá nhân'),

('PDK06', '2026-05-12', 'NV001', 'KH002', N'Nhóm');

/* --- Phiếu đặt cọc --- */
INSERT INTO PHIEU_DAT_COC VALUES
('PDC05', GETDATE(), 3000000,
 N'Đã đặt cọc', 'KH001', 'NV002'),

('PDC06', GETDATE(), 2200000,
 N'Đã đặt cọc', 'KH002', 'NV001');

/* =========================================================
   LỊCH ĐÃ XỬ LÝ
========================================================= */

INSERT INTO LICH VALUES
(
    'LICH0007',
    DATEADD(DAY, 7, GETDATE()),
    N'Xem phòng',
    N'Đã xử lý',
    'PDK05',
    NULL,
    'KTX001',
    'P101',
    'NV002'
),

(
    'LICH0008',
    DATEADD(DAY, 8, GETDATE()),
    N'Nhận phòng',
    N'Đã xử lý',
    NULL,
    'PDC05',
    'KTX002',
    'P201',
    'NV001'
),

(
    'LICH0009',
    DATEADD(DAY, 9, GETDATE()),
    N'Xem phòng',
    N'Đã xử lý',
    'PDK06',
    NULL,
    'KTX001',
    'P102',
    'NV001'
),

(
    'LICH0010',
    DATEADD(DAY, 10, GETDATE()),
    N'Nhận phòng',
    N'Đã xử lý',
    NULL,
    'PDC06',
    'KTX002',
    'P201',
    'NV002'
);

/* =========================================================
   GIƯỜNG
========================================================= */

INSERT INTO LICH_GIUONG VALUES
('LICH0007', 'G3'),
('LICH0008', 'G1'),
('LICH0009', 'G2'),
('LICH0010', 'G2');

/* =========================================================
   KIỂM TRA LỊCH ĐÃ XỬ LÝ CHƯA CÓ HỢP ĐỒNG
========================================================= */

SELECT l.*
FROM LICH l
LEFT JOIN HOP_DONG_THUE h
    ON l.MA_PHIEU = h.MA_PHIEU
WHERE l.TRANG_THAI = N'Đã xử lý'
  AND h.MA_HOP_DONG IS NULL;
GO

SELECT * FROM CHINH_SACH_THUE;
SELECT * FROM KY_TUC_XA;
SELECT * FROM PHONG;
SELECT * FROM GIUONG;
SELECT * FROM TAI_KHOAN;
SELECT * FROM NHAN_VIEN;
SELECT * FROM KHACH_HANG;
SELECT * FROM PHIEU_DANG_KY_THUE;
SELECT * FROM PHIEU_DAT_COC;
SELECT * FROM LICH;
SELECT * FROM LICH_GIUONG;
SELECT * FROM HOP_DONG_THUE;
SELECT * FROM BIEN_BAN_BAN_GIAO;
SELECT * FROM BB_BG_CHI_TIET;
SELECT * FROM PHIEU_THANH_TOAN;
SELECT * FROM BIEN_BAN_TRA_PHONG;
