-- ============================================
-- XUANXUANXUANXUANXUANXUANXUANXUANXUANXUANXUAN 
-- ============================================
-- DROP HET SP
-- DROP PROC IF EXISTS SP_GetBienBanTraPhong;
-- DROP PROC IF EXISTS SP_UpdateBienBanTraPhong;
-- DROP PROC IF EXISTS sp_GetThongTinHoanCoc;
-- DROP PROC IF EXISTS sp_GetLapPhieuHoanCoc;
-- DROP PROC IF EXISTS sp_GetHienThiPHC;
-- DROP PROC IF EXISTS sp_ThanhToanHoanCoc;
-- DROP PROC IF EXISTS sp_get_lich_hen_nhan_vien;
-- DROP PROC IF EXISTS sp_nhan_vien_nhan_lich;
-- DROP PROC IF EXISTS sp_nhan_vien_huy_lich;
-- GO
-- ============================================
-- STORED PROCEDURES FOR DORM MANAGEMENT SYSTEM
-- ============================================



CREATE PROC SP_GetBienBanTraPhong
    @TrangThai NVARCHAR(50) = '',
    @SortDir VARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.MA_BB_TRA_PHONG AS ID,
        ISNULL(kh.MA_KH, 'N/A') AS MA_KHACH_HANG,
        ISNULL(kh.TEN_KH, N'Khách hàng') AS HO_TEN,
        ISNULL(l.MA_PHONG, 'N/A') AS MA_PHONG,
        CONVERT(VARCHAR(10), b.NGAY, 23) AS NGAY_TRA,
        b.TRANG_THAI
    FROM BIEN_BAN_TRA_PHONG b
    LEFT JOIN HOP_DONG_THUE hd ON b.MA_HOP_DONG = hd.MA_HOP_DONG
    LEFT JOIN LICH l ON hd.MA_PHIEU = l.MA_PHIEU
    LEFT JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
    LEFT JOIN KHACH_HANG kh ON pdc.MA_KH = kh.MA_KH
    WHERE (@TrangThai = '' OR b.TRANG_THAI = @TrangThai)
    ORDER BY 
        CASE WHEN @SortDir = 'ASC' THEN b.NGAY END ASC,
        CASE WHEN @SortDir = 'DESC' THEN b.NGAY END DESC;
END
GO

-- Test SP trực tiếp
EXEC SP_GetBienBanTraPhong @TrangThai = '', @SortDir = 'DESC'
GO
SELECT * FROM BIEN_BAN_TRA_PHONG;
-- Hoặc kiểm tra xem BIEN_BAN_TRA_PHONG có dữ liệu không
SELECT TOP 10 * FROM BIEN_BAN_TRA_PHONG ORDER BY NGAY DESC
GO

--=============================
-- SP_UpdateBienBanTraPhong
-- Cập nhật TRANG_THAI dựa vào MA_BB_TRA_PHONG
DROP PROC IF EXISTS SP_UpdateBienBanTraPhong
GO

CREATE PROCEDURE SP_UpdateBienBanTraPhong
    @MA_BB_TRA_PHONG VARCHAR(5),
    @TRANG_THAI NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra trạng thái hợp lệ
    IF @TRANG_THAI NOT IN (N'Đã hẹn', N'Đang chờ xử lí', N'Đã xử lí')
    BEGIN
        RAISERROR (N'Trạng thái không hợp lệ.', 16, 1);
        RETURN;
    END

    IF @MA_BB_TRA_PHONG IS NULL
    BEGIN
        RAISERROR (N'Mã biên bản trả phòng không tồn tại.', 16, 1);
        RETURN;
    END

    -- Cập nhật trạng thái
    UPDATE BIEN_BAN_TRA_PHONG
    SET TRANG_THAI = @TRANG_THAI
    WHERE MA_BB_TRA_PHONG = @MA_BB_TRA_PHONG;

    PRINT N'Cập nhật trạng thái biên bản trả phòng thành công.';
END;
GO


-- Trang thông tin hoàn cọc
CREATE OR ALTER PROCEDURE sp_GetThongTinHoanCoc
    @MA_KH VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Thông tin khách hàng + phòng
    SELECT TOP 1
        KH.MA_KH,
        KH.TEN_KH,
        TK.EMAIL,
        KH.CCCD,
        KH.SDT,
        KH.GIOI_TINH,
        KH.NGAY_SINH,
        P.MA_PHONG,
        P.IMAGE_URL,
        KTX.TEN_KTX,
        G.MA_GIUONG,
        G.GIA
    FROM KHACH_HANG KH
        LEFT JOIN TAI_KHOAN TK
            ON KH.MA_TK = TK.MA_TK

        INNER JOIN PHIEU_DANG_KY_THUE PDK
            ON KH.MA_KH = PDK.MA_KH

        INNER JOIN LICH L
            ON PDK.MA_PDK = L.MA_PDK

        INNER JOIN PHONG P
            ON L.MA_KTX = P.MA_KTX
           AND L.MA_PHONG = P.MA_PHONG

        INNER JOIN KY_TUC_XA KTX
            ON P.MA_KTX = KTX.MA_KTX

        INNER JOIN LICH_GIUONG LG
            ON L.MA_PHIEU = LG.MA_PHIEU

        INNER JOIN GIUONG G
            ON LG.MA_GIUONG = G.MA_GIUONG
           AND G.MA_KTX = L.MA_KTX
           AND G.MA_PHONG = L.MA_PHONG
    WHERE KH.MA_KH = @MA_KH;

    -- 2. Danh sách vật dụng
    SELECT
        CT.MA_VT,
        CT.TEN_VAT_TU,
        CT.GIA_TRI,
        CT.SO_LUONG
    FROM KHACH_HANG KH
        INNER JOIN PHIEU_DANG_KY_THUE PDK
            ON KH.MA_KH = PDK.MA_KH

        INNER JOIN LICH L
            ON PDK.MA_PDK = L.MA_PDK

        INNER JOIN HOP_DONG_THUE HD
            ON L.MA_PHIEU = HD.MA_PHIEU

        INNER JOIN BIEN_BAN_BAN_GIAO BB
            ON HD.MA_HOP_DONG = BB.MA_HOP_DONG

        INNER JOIN BB_BG_CHI_TIET CT
            ON BB.MA_BAN_GIAO = CT.MA_BAN_GIAO
    WHERE KH.MA_KH = @MA_KH;
END;
GO

--====================
-- Trang lập phiếu hoàn cọc
CREATE OR ALTER PROCEDURE sp_GetLapPhieuHoanCoc
    @MA_HOP_DONG VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. DANH SÁCH VẬT DỤNG (UI sẽ quyết định cái nào hư hỏng)
    SELECT 
        ct.MA_VT,
        ct.TEN_VAT_TU,
        ct.GIA_TRI AS VALUE,
        ct.SO_LUONG AS QUANTITY
    FROM BIEN_BAN_BAN_GIAO bb
    INNER JOIN BB_BG_CHI_TIET ct 
        ON bb.MA_BAN_GIAO = ct.MA_BAN_GIAO
    WHERE bb.MA_HOP_DONG = @MA_HOP_DONG;

    -- 2. TỔNG TIỀN COC
    SELECT 
        pdc.SO_TIEN AS TIEN_COC
    FROM HOP_DONG_THUE hd
    INNER JOIN LICH l ON hd.MA_PHIEU = l.MA_PHIEU
    LEFT JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
    WHERE hd.MA_HOP_DONG = @MA_HOP_DONG;
END
GO
-- Trang hiển thị phiếu hoàn cọc

CREATE OR ALTER PROCEDURE sp_GetHienThiPHC
    @MA_HOP_DONG VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Customer + Room + Bed + Contact information (single row)
    SELECT TOP 1
        KH.MA_KH,
        KH.TEN_KH,
        TK.EMAIL,
        KH.CCCD,
        KH.SDT,
        KH.GIOI_TINH,
        KH.NGAY_SINH,
        P.MA_PHONG,
        P.IMAGE_URL,
        KTX.TEN_KTX,
        G.MA_GIUONG,
        G.GIA
    FROM HOP_DONG_THUE HD
        INNER JOIN LICH L ON HD.MA_PHIEU = L.MA_PHIEU
        INNER JOIN PHIEU_DANG_KY_THUE PDK ON L.MA_PDK = PDK.MA_PDK
        INNER JOIN KHACH_HANG KH ON PDK.MA_KH = KH.MA_KH
        LEFT JOIN TAI_KHOAN TK ON KH.MA_TK = TK.MA_TK
        INNER JOIN PHONG P ON L.MA_KTX = P.MA_KTX AND L.MA_PHONG = P.MA_PHONG
        INNER JOIN KY_TUC_XA KTX ON P.MA_KTX = KTX.MA_KTX
        INNER JOIN LICH_GIUONG LG ON L.MA_PHIEU = LG.MA_PHIEU
        INNER JOIN GIUONG G ON LG.MA_GIUONG = G.MA_GIUONG AND G.MA_KTX = L.MA_KTX AND G.MA_PHONG = L.MA_PHONG
    WHERE HD.MA_HOP_DONG = @MA_HOP_DONG;

    -- 2. Deposit amount (TIEN_COC)
    SELECT
        pdc.SO_TIEN AS TIEN_COC
    FROM HOP_DONG_THUE hd
        INNER JOIN LICH l ON hd.MA_PHIEU = l.MA_PHIEU
        LEFT JOIN PHIEU_DAT_COC pdc ON l.MA_PDC = pdc.MA_PDC
    WHERE hd.MA_HOP_DONG = @MA_HOP_DONG;
END
GO

-- Procedure: Thanh toán hoàn cọc (ghi phiếu thanh toán và liên kết)
CREATE OR ALTER PROCEDURE sp_ThanhToanHoanCoc
    @MA_HOP_DONG VARCHAR(5),
    @HINH_THUC NVARCHAR(50),
    @SO_TIEN INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @MA_HOP_DONG IS NULL OR LTRIM(RTRIM(@MA_HOP_DONG)) = ''
    BEGIN
        RAISERROR (N'Missing MA_HOP_DONG', 16, 1);
        RETURN;
    END

    IF @SO_TIEN IS NULL OR @SO_TIEN < 0
    BEGIN
        RAISERROR (N'Invalid SO_TIEN', 16, 1);
        RETURN;
    END

    -- Normalize payment method to values accepted by PHIEU_THANH_TOAN
    DECLARE @HT NVARCHAR(20);
    IF @HINH_THUC LIKE N'%Tiền%' OR @HINH_THUC LIKE N'%Tiền%'
        SET @HT = N'Tiền mặt';
    ELSE
        SET @HT = N'QR';

    -- tạp MA_THANH_TOAN mới
    DECLARE @MA_THANH_TOAN VARCHAR(5) = LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 5);

    INSERT INTO PHIEU_THANH_TOAN (MA_THANH_TOAN, HINH_THUC, NGAY, SO_TIEN, TRANG_THAI, MA_HOP_DONG)
    VALUES (@MA_THANH_TOAN, @HT, GETDATE(), @SO_TIEN, N'Đã thanh toán', @MA_HOP_DONG);

    -- Liên kết phiếu thanh toán với biên bản trả phòng gần nhất của hợp đồng
    UPDATE BIEN_BAN_TRA_PHONG
    SET MA_THANH_TOAN = @MA_THANH_TOAN,
        TRANG_THAI = N'Đã xử lí'
    WHERE MA_BB_TRA_PHONG = (
        SELECT TOP 1 MA_BB_TRA_PHONG FROM BIEN_BAN_TRA_PHONG WHERE MA_HOP_DONG = @MA_HOP_DONG ORDER BY NGAY DESC
    );

    -- trả về mã thanh toán để UI có thể hiển thị hoặc sử dụng tiếp
    SELECT @MA_THANH_TOAN AS MA_THANH_TOAN;
END;
GO 

-- lấy thông tin trang lịch hẹn nhân viên 
CREATE OR ALTER PROCEDURE sp_get_lich_hen_nhan_vien
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        l.MA_PHIEU,
        l.LOAI,
        l.TRANG_THAI,
        l.NGAY_GIO,
        CONVERT(VARCHAR(10), l.NGAY_GIO, 103) AS NGAY_HEN,
        CONVERT(VARCHAR(5), l.NGAY_GIO, 108) AS GIO_HEN,

        p.MA_PHONG,
        p.IMAGE_URL,
        p.MO_TA,

        ktx.MA_KTX,
        ktx.TEN_KTX,
        room_price.GIA_PHONG,
        ktx.GIA_DIEN,
        ktx.GIA_NUOC,
        ktx.WIFI,
        ktx.GUI_XE,
        ktx.DICH_VU,

        kh.MA_KH,
        kh.TEN_KH,
        kh.SDT,
        kh.CCCD,
        kh.GIOI_TINH,

        ISNULL(giuong.MA_GIUONGS, N'') AS MA_GIUONGS,
        ISNULL(giuong.TONG_TIEN, 0) AS TONG_TIEN
    FROM LICH l
    INNER JOIN PHONG p
        ON l.MA_KTX = p.MA_KTX
       AND l.MA_PHONG = p.MA_PHONG
    INNER JOIN KY_TUC_XA ktx
        ON l.MA_KTX = ktx.MA_KTX
    LEFT JOIN PHIEU_DANG_KY_THUE pdk
        ON l.MA_PDK = pdk.MA_PDK
    LEFT JOIN KHACH_HANG kh
        ON pdk.MA_KH = kh.MA_KH
    OUTER APPLY (
        SELECT
            STRING_AGG(CONVERT(VARCHAR(50), g.MA_GIUONG), ', ') AS MA_GIUONGS,
            SUM(g.GIA) AS TONG_TIEN
        FROM LICH_GIUONG lg
        INNER JOIN GIUONG g
            ON lg.MA_GIUONG = g.MA_GIUONG
        WHERE lg.MA_PHIEU = l.MA_PHIEU
           AND g.MA_KTX = l.MA_KTX
           AND g.MA_PHONG = l.MA_PHONG
    ) giuong
        OUTER APPLY (
                SELECT TOP 1 g.GIA AS GIA_PHONG
                FROM GIUONG g
                WHERE g.MA_KTX = l.MA_KTX
                    AND g.MA_PHONG = l.MA_PHONG
                ORDER BY g.MA_GIUONG
        ) room_price
        WHERE l.MA_NV IS NULL
    ORDER BY l.NGAY_GIO ASC, l.MA_PHIEU ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_nhan_vien_nhan_lich
    @MA_PHIEU VARCHAR(10),
    @MA_NV VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    IF @MA_PHIEU IS NULL OR LTRIM(RTRIM(@MA_PHIEU)) = ''
    BEGIN
        RAISERROR (N'MA_PHIEU không hợp lệ.', 16, 1);
        RETURN;
    END

    IF @MA_NV IS NULL OR LTRIM(RTRIM(@MA_NV)) = ''
    BEGIN
        RAISERROR (N'MA_NV không hợp lệ.', 16, 1);
        RETURN;
    END

        UPDATE LICH
        SET MA_NV = @MA_NV,
                TRANG_THAI = N'Đã xử lý'
        WHERE MA_PHIEU = @MA_PHIEU
            AND MA_NV IS NULL;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR (N'Không tìm thấy lịch phù hợp hoặc lịch đã được xử lý.', 16, 1);
        RETURN;
    END
END;
GO

CREATE OR ALTER PROCEDURE sp_nhan_vien_huy_lich
    @MA_PHIEU VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF @MA_PHIEU IS NULL OR LTRIM(RTRIM(@MA_PHIEU)) = ''
    BEGIN
        RAISERROR (N'MA_PHIEU không hợp lệ.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    DELETE FROM LICH_GIUONG
    WHERE MA_PHIEU = @MA_PHIEU;

    DELETE FROM LICH
    WHERE MA_PHIEU = @MA_PHIEU
      AND MA_NV IS NULL;

    IF @@ROWCOUNT = 0
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR (N'Không tìm thấy lịch phù hợp để hủy.', 16, 1);
        RETURN;
    END

    COMMIT TRANSACTION;
END;
GO
-- ============================================
-- XUANXUANXUANXUANXUANXUANXUANXUANXUANXUANXUAN
-- ============================================