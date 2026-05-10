USE DORM
GO

CREATE OR ALTER PROCEDURE SP_LOGIN
    @EMAIL VARCHAR(100),
    @MAT_KHAU VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        tk.MA_TK,
        tk.EMAIL,
        tk.ROLE,

        nv.MA_NV,
        nv.TEN_NV,

        kh.MA_KH,
        kh.TEN_KH

    FROM TAI_KHOAN tk
    LEFT JOIN NHAN_VIEN nv 
        ON tk.MA_TK = nv.MA_TK

    LEFT JOIN KHACH_HANG kh 
        ON tk.MA_TK = kh.MA_TK

    WHERE tk.EMAIL = @EMAIL
      AND tk.MAT_KHAU = @MAT_KHAU
END
GO


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



CREATE OR ALTER PROC SP_GetBienBanTraPhong
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

CREATE OR ALTER PROCEDURE SP_UPDATE_KHACH_HANG
    @MA_KH VARCHAR(5),
    @TEN_KH NVARCHAR(250),
    @SDT VARCHAR(11),
    @CCCD VARCHAR(12),
    @GIOI_TINH NVARCHAR(3),
    @EMAIL VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE KHACH_HANG
    SET TEN_KH = @TEN_KH,
        SDT = @SDT,
        CCCD = @CCCD,
        GIOI_TINH = @GIOI_TINH
    WHERE MA_KH = @MA_KH;

    IF @EMAIL IS NOT NULL
    BEGIN
        UPDATE TAI_KHOAN
        SET EMAIL = @EMAIL
        WHERE MA_TK = (
            SELECT MA_TK
            FROM KHACH_HANG
            WHERE MA_KH = @MA_KH
        );
    END
END
GO

-- ── SP 1: Danh sách phòng ────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE SP_GetDanhSachPhong
    @Search     NVARCHAR(100) = '',
    @TrangThai  NVARCHAR(10)  = '',
    @SortDir    VARCHAR(4)    = 'ASC',
    @Ward       NVARCHAR(100) = '',   
    @GioiTinh   NVARCHAR(3)   = '',   
    @MinBeds    INT           = 1,
    @Page       INT           = 1,
    @PageSize   INT           = 6
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- 1. Đổ dữ liệu vào bảng tạm #KetQua
    SELECT
        p.MA_PHONG,
        p.IMAGE_URL,
        p.SL_GIUONG,
        p.SL_GIUONG_TRONG,
        p.TRANG_THAI,
        p.MA_KTX,
        k.TEN_KTX,
        k.DIA_CHI,
        k.QUY_DINH,
        ISNULL(gp.GIA_MIN, 0) AS GIA_MIN,
        ISNULL(gp.GIA_MAX, 0) AS GIA_MAX
    INTO #KetQua
    FROM PHONG p
    LEFT JOIN KY_TUC_XA k  ON p.MA_KTX  = k.MA_KTX
    LEFT JOIN (
        SELECT MA_PHONG, MIN(GIA) AS GIA_MIN, MAX(GIA) AS GIA_MAX
        FROM GIUONG GROUP BY MA_PHONG
    ) gp ON p.MA_PHONG = gp.MA_PHONG
    WHERE
        (@Search    = '' OR p.MA_PHONG LIKE '%' + @Search + '%')
        AND (@TrangThai = '' OR p.TRANG_THAI = @TrangThai)
        AND (@Ward      = '' OR k.DIA_CHI  LIKE '%' + @Ward + '%')
        AND (@GioiTinh  = '' OR k.QUY_DINH LIKE '%' + @GioiTinh + '%')
        AND (@MinBeds <= p.SL_GIUONG_TRONG);

    -- 2. Trả về tổng số bản ghi
    SELECT COUNT(*) AS TONG_BAN_GHI FROM #KetQua;

    -- 3. Trả về dữ liệu phân trang
    SELECT *
    FROM #KetQua
    ORDER BY
        CASE WHEN @SortDir = 'ASC'  THEN GIA_MIN END ASC,
        CASE WHEN @SortDir = 'DESC' THEN GIA_MAX END DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    -- Xóa bảng tạm sau khi dùng
    DROP TABLE #KetQua;
END;
GO

-- ── SP 2: Chi tiết phòng ─────────────────────────────────────────────────────
CREATE OR ALTER PROCEDURE SP_GetChiTietPhong
    @MaPhong VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    -- Thông tin phòng + KTX
    SELECT
        p.MA_PHONG,
        p.IMAGE_URL,
        p.SL_GIUONG,
        p.SL_GIUONG_TRONG,
        p.TRANG_THAI,
        p.MA_KTX,
        p.MO_TA AS MO_TA_PHONG,

        k.TEN_KTX,
        k.DIA_CHI,
        k.QUY_DINH,
        k.GIA_DIEN,
        k.GIA_NUOC,
        k.WIFI,
        k.GUI_XE,
        k.DICH_VU,

        ISNULL(MIN(g.GIA), 0) AS GIA_MIN,
        ISNULL(MAX(g.GIA), 0) AS GIA_MAX
    FROM PHONG p
    LEFT JOIN KY_TUC_XA k
        ON p.MA_KTX = k.MA_KTX
    LEFT JOIN GIUONG g
        ON p.MA_KTX = g.MA_KTX
        AND p.MA_PHONG = g.MA_PHONG
    WHERE p.MA_PHONG = @MaPhong
    GROUP BY
        p.MA_PHONG,
        p.IMAGE_URL,
        p.SL_GIUONG,
        p.SL_GIUONG_TRONG,
        p.TRANG_THAI,
        p.MA_KTX,
        p.MO_TA,
        k.TEN_KTX,
        k.DIA_CHI,
        k.QUY_DINH,
        k.GIA_DIEN,
        k.GIA_NUOC,
        k.WIFI,
        k.GUI_XE,
        k.DICH_VU;

    -- Danh sách giường
    SELECT
        MA_GIUONG,
        TRANG_THAI,
        GIA
    FROM GIUONG
    WHERE MA_PHONG = @MaPhong
    ORDER BY MA_GIUONG;
END;
GO


--SP3
CREATE OR ALTER PROCEDURE SP_GetThongTinKhachHang
@SDT VARCHAR(11)
AS
BEGIN
	SELECT K.*, TK.EMAIL 
	FROM KHACH_HANG K JOIN TAI_KHOAN TK
	ON TK.MA_TK = K.MA_TK
	WHERE SDT = @SDT;
END;
GO

--SP4
CREATE OR ALTER PROCEDURE SP_ThemKhachHang
    @HoTen NVARCHAR(150),
    @SDT VARCHAR(15),
    @NgaySinh DATE,
    @Email VARCHAR(100),
    @CCCD VARCHAR(20),
    @GioiTinh NVARCHAR(10),
    @MA_KH_MOI VARCHAR(5) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MA_KH VARCHAR(5);
    DECLARE @MA_TK VARCHAR(5);
    DECLARE @MAT_KHAU VARCHAR(20);

    -- kiểm tra khách hàng đã tồn tại chưa
    SELECT @MA_KH = MA_KH
    FROM KHACH_HANG
    WHERE SDT = @SDT;

    IF @MA_KH IS NOT NULL
    BEGIN
        SET @MA_KH_MOI = @MA_KH;
        RETURN;
    END

    -- tạo mã tài khoản mới
    SELECT @MA_TK =
        'TK' + RIGHT('000' + CAST(ISNULL(MAX(CAST(SUBSTRING(MA_TK, 3, 3) AS INT)), 0) + 1 AS VARCHAR), 3)
    FROM TAI_KHOAN
    WHERE MA_TK LIKE 'TK%';

    -- tạo mã khách hàng mới
    SELECT @MA_KH =
        'KH' + RIGHT('000' + CAST(ISNULL(MAX(CAST(SUBSTRING(MA_KH, 3, 3) AS INT)), 0) + 1 AS VARCHAR), 3)
    FROM KHACH_HANG
    WHERE MA_KH LIKE 'KH%';

    -- mật khẩu = ddMMyyyy từ ngày sinh
    SET @MAT_KHAU =
        RIGHT('0' + CAST(DAY(@NgaySinh) AS VARCHAR), 2) +
        RIGHT('0' + CAST(MONTH(@NgaySinh) AS VARCHAR), 2) +
        CAST(YEAR(@NgaySinh) AS VARCHAR);

    INSERT INTO TAI_KHOAN (MA_TK, MAT_KHAU, EMAIL, ROLE)
    VALUES (@MA_TK, @MAT_KHAU, @Email, 'CUSTOMER');

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
        @MA_KH,
        @HoTen,
        @NgaySinh,
        @CCCD,
        @SDT,
        @GioiTinh,
        @MA_TK
    );

    SET @MA_KH_MOI = @MA_KH;
END;
GO

CREATE OR ALTER PROCEDURE SP_XuLyDatLichXemPhongKH
    @NGAY_DANG_KY DATE,
    @MA_KH VARCHAR(5),
    @HINH_THUC_THUE NVARCHAR(25),
    @NGAY_HEN DATETIME,
    @LOAI NVARCHAR(14),
    @TRANG_THAI NVARCHAR(20),
    @MA_KTX VARCHAR(6),
    @MA_PHONG VARCHAR(10),
    @DS_MA_GIUONG NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MA_PDK VARCHAR(5);
    DECLARE @MA_PHIEU VARCHAR(10);

    BEGIN TRY
        BEGIN TRAN;

        -- Sinh mã phiếu đăng ký: PD001, PD002...
        SELECT @MA_PDK =
            'PD' + RIGHT(
                '000' + CAST(
                    ISNULL(
                        MAX(
                            CAST(
                                SUBSTRING(MA_PDK, 3, 3) AS INT
                            )
                        ),
                        0
                    ) + 1
                    AS VARCHAR
                ),
                3
            )
        FROM PHIEU_DANG_KY_THUE
        WHERE MA_PDK LIKE 'PD[0-9][0-9][0-9]';

        -- Sinh mã lịch: L000001, L000002...
        SELECT @MA_PHIEU =
            'L' + RIGHT(
                '000000' + CAST(
                    ISNULL(
                        MAX(
                            CAST(
                                SUBSTRING(MA_PHIEU, 2, 6) AS INT
                            )
                        ),
                        0
                    ) + 1
                    AS VARCHAR
                ),
                6
            )
        FROM LICH
        WHERE MA_PHIEU LIKE 'L[0-9][0-9][0-9][0-9][0-9][0-9]';

        INSERT INTO PHIEU_DANG_KY_THUE
        (
            MA_PDK,
            NGAY_DANG_KY,
            MA_KH,
            HINH_THUC_THUE
        )
        VALUES
        (
            @MA_PDK,
            @NGAY_DANG_KY,
            @MA_KH,
            @HINH_THUC_THUE
        );

        INSERT INTO LICH
        (
            MA_PHIEU,
            NGAY_GIO,
            LOAI,
            TRANG_THAI,
            MA_PDK,
            MA_KTX,
            MA_PHONG,
            MA_NV
        )
        VALUES
        (
            @MA_PHIEU,
            @NGAY_HEN,
            @LOAI,
            @TRANG_THAI,
            @MA_PDK,
            @MA_KTX,
            @MA_PHONG,
            NULL
        );

        INSERT INTO LICH_GIUONG
        (
            MA_PHIEU,
            MA_GIUONG
        )
        SELECT
            @MA_PHIEU,
            LTRIM(RTRIM(value))
        FROM STRING_SPLIT(@DS_MA_GIUONG, ',')
        WHERE LTRIM(RTRIM(value)) <> '';

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE SP_XuLyDatLichXemPhongVL
    @NGAY_DANG_KY DATE,
    @TEN_KH NVARCHAR(250),
    @NGAY_SINH DATE,
    @CCCD VARCHAR(12),
    @SDT VARCHAR(11),
    @GIOI_TINH NVARCHAR(3),
    @EMAIL VARCHAR(100),
    @HINH_THUC_THUE NVARCHAR(25),
    @NGAY_HEN DATETIME,        
    @LOAI NVARCHAR(14),
    @TRANG_THAI NVARCHAR(20),
    @MA_KTX VARCHAR(6),
    @MA_PHONG VARCHAR(10),
    @DS_MA_GIUONG NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MA_KH VARCHAR(5);

    EXEC SP_ThemKhachHang
        @HoTen = @TEN_KH, @SDT = @SDT, @NgaySinh = @NGAY_SINH,
        @Email = @EMAIL, @CCCD = @CCCD, @GioiTinh = @GIOI_TINH,
        @MA_KH_MOI = @MA_KH OUTPUT;

    EXEC SP_XuLyDatLichXemPhongKH
        @NGAY_DANG_KY = @NGAY_DANG_KY, @MA_KH = @MA_KH,
        @HINH_THUC_THUE = @HINH_THUC_THUE, @NGAY_HEN = @NGAY_HEN,
        @LOAI = @LOAI, @TRANG_THAI = @TRANG_THAI,
        @MA_KTX = @MA_KTX, @MA_PHONG = @MA_PHONG, @DS_MA_GIUONG = @DS_MA_GIUONG;
END;
GO

CREATE OR ALTER PROCEDURE SP_GetLichByNhanVien
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
END;
GO

CREATE OR ALTER PROCEDURE SP_DoiLich
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
END;
GO

CREATE OR ALTER PROCEDURE SP_HuyLich
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
END;
GO
