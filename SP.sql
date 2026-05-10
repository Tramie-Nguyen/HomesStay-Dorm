USE DORM
GO

CREATE PROCEDURE SP_LOGIN
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

CREATE PROCEDURE SP_UPDATE_KHACH_HANG
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

CREATE PROCEDURE SP_UPSERT_HANDOVER
    @rentalId VARCHAR(5),
    @contractUrl VARCHAR(255),
    @handoverUrl VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @maHopDong VARCHAR(5);

    SELECT TOP 1 @maHopDong = MA_HOP_DONG
    FROM HOP_DONG_THUE
    WHERE MA_PHIEU = @rentalId;

    IF @maHopDong IS NULL
    BEGIN
      DECLARE @nextHdNum INT = ISNULL(
        (
          SELECT MAX(TRY_CAST(SUBSTRING(MA_HOP_DONG, 3, 10) AS INT))
          FROM HOP_DONG_THUE
          WHERE MA_HOP_DONG LIKE 'HD%'
        ),
        0
      ) + 1;

      SET @maHopDong = 'HD' + RIGHT('000' + CAST(@nextHdNum AS VARCHAR(3)), 3);

      INSERT INTO HOP_DONG_THUE (
        MA_HOP_DONG,
        MA_PHIEU,
        TRANG_THAI,
        IMAGE_URL
      )
      VALUES (
        @maHopDong,
        @rentalId,
        N'Đã ký',
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

    IF EXISTS (
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
      DECLARE @nextBbNum INT = ISNULL(
        (
          SELECT MAX(TRY_CAST(SUBSTRING(MA_BAN_GIAO, 3, 10) AS INT))
          FROM BIEN_BAN_BAN_GIAO
          WHERE MA_BAN_GIAO LIKE 'BB%'
        ),
        0
      ) + 1;

      DECLARE @maBanGiao VARCHAR(5) =
        'BB' + RIGHT('000' + CAST(@nextBbNum AS VARCHAR(3)), 3);

      INSERT INTO BIEN_BAN_BAN_GIAO (
        MA_BAN_GIAO,
        NGAY,
        MA_HOP_DONG,
        MA_NV,
        IMAGE_URL
      )
      VALUES (
        @maBanGiao,
        CAST(GETDATE() AS DATE),
        @maHopDong,
        NULL,
        @handoverUrl
      );
    END
END
GO

GO
CREATE PROCEDURE SP_GET_RENTAL_DETAILS
    @id VARCHAR(5)
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
      JOIN PHONG p ON l.MA_KTX = p.MA_KTX
          AND l.MA_PHONG = p.MA_PHONG
      JOIN KY_TUC_XA ktx ON p.MA_KTX = ktx.MA_KTX 
      JOIN PHIEU_DANG_KY_THUE pdk ON l.MA_PDK = pdk.MA_PDK
      JOIN KHACH_HANG kh ON pdk.MA_KH = kh.MA_KH
      LEFT JOIN TAI_KHOAN tk ON kh.MA_TK = tk.MA_TK
      LEFT JOIN HOP_DONG_THUE hd ON hd.MA_PHIEU = l.MA_PHIEU
      LEFT JOIN BIEN_BAN_BAN_GIAO bb ON bb.MA_HOP_DONG = hd.MA_HOP_DONG

      WHERE l.MA_PHIEU = @id;
END
GO

CREATE PROCEDURE SP_GET_RENTAL_BEDS
    @id VARCHAR(5),
    @ktxId VARCHAR(5),
    @roomId VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT lg.MA_GIUONG, g.GIA
    FROM LICH_GIUONG lg
    INNER JOIN GIUONG g ON g.MA_KTX = @ktxId
                       AND g.MA_PHONG = @roomId
                       AND g.MA_GIUONG = lg.MA_GIUONG
    WHERE lg.MA_PHIEU = @id;
END
GO

CREATE PROCEDURE SP_GET_ALL_ROOM_BEDS
    @ktxId VARCHAR(5),
    @roomId VARCHAR(5)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT MA_GIUONG, GIA
    FROM GIUONG
    WHERE MA_KTX = @ktxId AND MA_PHONG = @roomId;
END
GO

SELECT * FROM KHACH_HANG;