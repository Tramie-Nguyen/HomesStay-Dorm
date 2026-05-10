IF OBJECT_ID('SP_GetLichByNhanVien', 'P') IS NOT NULL
    DROP PROCEDURE SP_GetLichByNhanVien
GO

CREATE PROCEDURE SP_GetLichByNhanVien
    @MaNV VARCHAR(5),
    @Thang INT,
    @Nam INT
AS
BEGIN
    SELECT 
        l.MA_PHIEU AS id,
        COALESCE(kh1.TEN_KH, kh2.TEN_KH) AS khachHang,
        COALESCE(kh1.SDT, kh2.SDT) AS sdt,
        DAY(l.NGAY_GIO) AS ngay,
        FORMAT(l.NGAY_GIO, 'HH:mm') AS gio,
        l.LOAI AS loai,
        l.TRANG_THAI AS trangThai,
        l.MA_PHONG AS maPhong,
        ktx.TEN_KTX AS ktx,
        p.IMAGE_URL AS hinhAnh
    FROM LICH l
    LEFT JOIN PHIEU_DANG_KY_THUE pdk ON l.MA_PDK = pdk.MA_PDK
    LEFT JOIN KHACH_HANG kh1 ON pdk.MA_KH = kh1.MA_KH
    LEFT JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
    LEFT JOIN KHACH_HANG kh2 ON pdc.MA_KH = kh2.MA_KH
    LEFT JOIN KY_TUC_XA ktx ON l.MA_KTX = ktx.MA_KTX
    LEFT JOIN PHONG p ON l.MA_KTX = p.MA_KTX AND l.MA_PHONG = p.MA_PHONG
    WHERE l.MA_NV = @MaNV 
      AND MONTH(l.NGAY_GIO) = @Thang 
      AND YEAR(l.NGAY_GIO) = @Nam;
END
GO

IF OBJECT_ID('SP_DoiLich', 'P') IS NOT NULL
    DROP PROCEDURE SP_DoiLich
GO

CREATE PROCEDURE SP_DoiLich
    @MaPhieu VARCHAR(10),
    @NgayGioMoi DATETIME
AS
BEGIN
    -- Kiểm tra xem lịch có tồn tại và đang 'Chưa xử lý' hay không
    IF EXISTS (SELECT 1 FROM LICH WHERE MA_PHIEU = @MaPhieu AND TRANG_THAI != N'Đã xử lý')
    BEGIN
        -- Chạy lệnh Update (Sẽ bị chặn nếu @NgayGioMoi nhỏ hơn thời gian hiện tại do CHECK CONSTRAINT của bạn)
        UPDATE LICH
        SET NGAY_GIO = @NgayGioMoi
        WHERE MA_PHIEU = @MaPhieu;
    END
    ELSE
    BEGIN
        RAISERROR(N'Không thể dời lịch. Lịch này đã được xử lý hoặc không tồn tại.', 16, 1);
    END
END
GO

IF OBJECT_ID('SP_HuyLich', 'P') IS NOT NULL
    DROP PROCEDURE SP_HuyLich
GO

CREATE PROCEDURE SP_HuyLich
    @MaPhieu VARCHAR(10)
AS
BEGIN
    -- Kiểm tra đúng điều kiện mới cho hủy
    IF EXISTS (SELECT 1 FROM LICH WHERE MA_PHIEU = @MaPhieu AND LOAI = N'Xem phòng' AND TRANG_THAI != N'Đã xử lý')
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;
            
            -- 1. Xóa khóa ngoại trong bảng LICH_GIUONG trước (nếu có khách chọn giường trước đó)
            DELETE FROM LICH_GIUONG WHERE MA_PHIEU = @MaPhieu;
            
            -- 2. Xóa lịch trong bảng chính
            DELETE FROM LICH WHERE MA_PHIEU = @MaPhieu;
            
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW; -- Quăng lỗi về cho Backend Node.js đọc
        END CATCH
    END
    ELSE
    BEGIN
        RAISERROR(N'Lỗi: Chỉ có thể hủy lịch "Xem phòng" và đang ở trạng thái "Chưa xử lý".', 16, 1);
    END
END
GO