USE DORM
GO

/* =========================================================
   SP_LOGIN
========================================================= */

CREATE OR ALTER PROCEDURE SP_LOGIN
    @EMAIL VARCHAR(100),
    @MAT_KHAU VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM TAI_KHOAN
        WHERE EMAIL = @EMAIL
          AND MAT_KHAU = @MAT_KHAU
    )
    BEGIN
        RAISERROR(N'Sai tài khoản hoặc mật khẩu', 16, 1);
        RETURN;
    END

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

/* =========================================================
   SP_UPDATE_KHACH_HANG
========================================================= */

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

    IF NOT EXISTS
    (
        SELECT 1
        FROM KHACH_HANG
        WHERE MA_KH = @MA_KH
    )
    BEGIN
        RAISERROR(N'Khách hàng không tồn tại', 16, 1);
        RETURN;
    END

    IF EXISTS
    (
        SELECT 1
        FROM TAI_KHOAN
        WHERE EMAIL = @EMAIL
          AND MA_TK <>
          (
                SELECT MA_TK
                FROM KHACH_HANG
                WHERE MA_KH = @MA_KH
          )
    )
    BEGIN
        RAISERROR(N'Email đã tồn tại', 16, 1);
        RETURN;
    END

    UPDATE KHACH_HANG
    SET TEN_KH = @TEN_KH,
        SDT = @SDT,
        CCCD = @CCCD,
        GIOI_TINH = @GIOI_TINH
    WHERE MA_KH = @MA_KH;

    UPDATE TAI_KHOAN
    SET EMAIL = @EMAIL
    WHERE MA_TK =
    (
        SELECT MA_TK
        FROM KHACH_HANG
        WHERE MA_KH = @MA_KH
    );
END
GO

/* =========================================================
   SP_UPSERT_HANDOVER
========================================================= */

CREATE OR ALTER PROCEDURE SP_UPSERT_HANDOVER
    @rentalId VARCHAR(10),
    @contractUrl VARCHAR(255),
    @handoverUrl VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @maHopDong VARCHAR(10);

    SELECT TOP 1
        @maHopDong = MA_HOP_DONG
    FROM HOP_DONG_THUE
    WHERE MA_PHIEU = @rentalId;

    /* =====================================================
       TẠO HỢP ĐỒNG NẾU CHƯA CÓ
    ===================================================== */

    IF @maHopDong IS NULL
    BEGIN
        DECLARE @nextHdNum INT;

        SELECT @nextHdNum =
            ISNULL
            (
                MAX(
                    TRY_CAST(
                        SUBSTRING(MA_HOP_DONG, 3, 10) AS INT
                    )
                ),
                0
            ) + 1
        FROM HOP_DONG_THUE
        WHERE MA_HOP_DONG LIKE 'HD%';

        SET @maHopDong =
            'HD' + RIGHT('000' + CAST(@nextHdNum AS VARCHAR(3)), 3);

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
            @maHopDong,
            CAST(GETDATE() AS DATE),
            DATEADD(MONTH, 6, GETDATE()),
            1,
            N'Hợp đồng thuê mặc định',
            N'Đã ký',
            @rentalId,
            @contractUrl
        );
    END
    ELSE
    BEGIN
        UPDATE HOP_DONG_THUE
        SET IMAGE_URL = @contractUrl,
            TRANG_THAI = N'Đã ký'
        WHERE MA_HOP_DONG = @maHopDong;
    END

    /* =====================================================
       UPSERT BIÊN BẢN BÀN GIAO
    ===================================================== */

    IF EXISTS
    (
        SELECT 1
        FROM BIEN_BAN_BAN_GIAO
        WHERE MA_HOP_DONG = @maHopDong
    )
    BEGIN
        UPDATE BIEN_BAN_BAN_GIAO
        SET IMAGE_URL = @handoverUrl,
            NGAY = CAST(GETDATE() AS DATE)
        WHERE MA_HOP_DONG = @maHopDong;
    END
    ELSE
    BEGIN
        DECLARE @nextBbNum INT;
        DECLARE @maBanGiao VARCHAR(10);

        SELECT @nextBbNum =
            ISNULL
            (
                MAX(
                    TRY_CAST(
                        SUBSTRING(MA_BAN_GIAO, 3, 10) AS INT
                    )
                ),
                0
            ) + 1
        FROM BIEN_BAN_BAN_GIAO
        WHERE MA_BAN_GIAO LIKE 'BB%';

        SET @maBanGiao =
            'BB' + RIGHT('000' + CAST(@nextBbNum AS VARCHAR(3)), 3);

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
            @maBanGiao,
            CAST(GETDATE() AS DATE),
            @maHopDong,
            NULL,
            @handoverUrl
        );
    END
END
GO

/* =========================================================
   SP_GET_RENTAL_DETAILS
========================================================= */

CREATE OR ALTER PROCEDURE SP_GET_RENTAL_DETAILS
    @id VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.MA_KTX,
        p.MA_PHONG,
        p.MA_PHONG AS TEN_PHONG,
        p.IMAGE_URL,
        p.SL_GIUONG,
        p.SL_GIUONG_TRONG,
        p.TRANG_THAI AS TRANG_THAI_PHONG,

        ktx.GIA_DIEN,
        ktx.GIA_NUOC,
        ktx.WIFI,
        ktx.GUI_XE,
        ktx.DICH_VU,

        l.MA_PHIEU,
        l.NGAY_GIO,
        l.LOAI,
        l.TRANG_THAI,

        kh.MA_KH,
        kh.TEN_KH,
        kh.SDT,
        kh.NGAY_SINH,
        kh.CCCD,
        kh.GIOI_TINH,

        tk.EMAIL,

        hd.MA_HOP_DONG,
        hd.NGAY_BD,
        hd.NGAY_KT,
        hd.TRANG_THAI AS TRANG_THAI_HOP_DONG,
        hd.IMAGE_URL AS HOP_DONG_IMAGE,

        bb.IMAGE_URL AS BIEN_BAN_IMAGE

    FROM LICH l

    JOIN PHONG p
        ON l.MA_KTX = p.MA_KTX
       AND l.MA_PHONG = p.MA_PHONG

    JOIN KY_TUC_XA ktx
        ON p.MA_KTX = ktx.MA_KTX

    JOIN PHIEU_DANG_KY_THUE pdk
        ON l.MA_PDK = pdk.MA_PDK

    JOIN KHACH_HANG kh
        ON pdk.MA_KH = kh.MA_KH

    LEFT JOIN TAI_KHOAN tk
        ON kh.MA_TK = tk.MA_TK

    LEFT JOIN HOP_DONG_THUE hd
        ON hd.MA_PHIEU = l.MA_PHIEU

    LEFT JOIN BIEN_BAN_BAN_GIAO bb
        ON bb.MA_HOP_DONG = hd.MA_HOP_DONG

    WHERE l.MA_PHIEU = @id;
END
GO

/* =========================================================
   SP_GET_RENTAL_BEDS
========================================================= */

CREATE OR ALTER PROCEDURE SP_GET_RENTAL_BEDS
    @id VARCHAR(10),
    @ktxId VARCHAR(6),
    @roomId VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        lg.MA_GIUONG,
        g.GIA,
        g.TRANG_THAI
    FROM LICH_GIUONG lg

    INNER JOIN GIUONG g
        ON g.MA_KTX = @ktxId
       AND g.MA_PHONG = @roomId
       AND g.MA_GIUONG = lg.MA_GIUONG

    WHERE lg.MA_PHIEU = @id;
END
GO

/* =========================================================
   SP_GET_ALL_ROOM_BEDS
========================================================= */

CREATE OR ALTER PROCEDURE SP_GET_ALL_ROOM_BEDS
    @ktxId VARCHAR(6),
    @roomId VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MA_GIUONG,
        GIA,
        TRANG_THAI
    FROM GIUONG
    WHERE MA_KTX = @ktxId
      AND MA_PHONG = @roomId;
END
GO

/* =========================================================
   TEST
========================================================= */

EXEC SP_LOGIN
    'kh1@gmail.com',
    '123';

EXEC SP_GET_RENTAL_DETAILS
    'LICH002';

EXEC SP_GET_RENTAL_BEDS
    'LICH002',
    'KTX001',
    'P101';

EXEC SP_GET_ALL_ROOM_BEDS
    'KTX001',
    'P101';
GO