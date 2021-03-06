const { NguoiHoc, GiaSu } = require("../models");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

const dangKiNguoiHoc = async (req, res) => {
  try {
    const {
      sdt,
      matKhau,
      hoTen,
      monHoc,
      lopHoc,
      tinhThanh,
      quanHuyen,
      phuongXa,
      duong,
      diaChi,
      mucLuong,
      soBuoi,
      thoiGian,
      thongTin,
      yeuCau,
    } = req.body;

    const salt = bcryptjs.genSaltSync(10);
    const hashPassword = bcryptjs.hashSync(matKhau, salt);

    const nguoiHocMoi = await NguoiHoc.create({
      sdt,
      matKhau: hashPassword,
      hoTen,
      monHoc,
      lopHoc,
      tinhThanh,
      quanHuyen,
      phuongXa,
      duong,
      diaChi,
      mucLuong,
      soBuoi,
      thoiGian,
      thongTin,
      yeuCau,
    });
    res.status(201).send(nguoiHocMoi);
  } catch (error) {
    res.status(500).send(error);
  }
};

const dangKiGiaSu = async (req, res) => {
  try {
    const {
      sdt,
      matKhau,
      email,
      tinhThanh,
      nguoiDung,
      vaiTro,
      hoTen,
      ngaySinh,
      nguyenQuan,
      giongNoi,
      diaChi,
      soCCCD,
      anhDaiDien,
      anhBangCap,
      anhCCCD,
      truongHoc,
      nganhHoc,
      namTotNghiep,
      hienLa,
      uuDiem,
      monDay,
      lopDay,
      khuVucDay,
      thoiGianDay,
    } = req.body;

    const salt = bcryptjs.genSaltSync(10);
    const hashPassword = bcryptjs.hashSync(matKhau, salt);

    const GiaSuMoi = await GiaSu.create({
      sdt,
      matKhau: hashPassword,
      email,
      tinhThanh,
      nguoiDung,
      vaiTro,
      hoTen,
      ngaySinh,
      nguyenQuan,
      giongNoi,
      diaChi,
      soCCCD,
      anhDaiDien,
      anhBangCap,
      anhCCCD,
      truongHoc,
      nganhHoc,
      namTotNghiep,
      hienLa,
      uuDiem,
      monDay,
      lopDay,
      khuVucDay,
      thoiGianDay,
    });
    res.status(201).send(GiaSuMoi);
  } catch (error) {
    res.status(500).send(error);
  }
};

const dangNhap = (Model) => async (req, res) => {
  try {
    const { sdt, matKhau } = req.body;

    const nguoiDung = await Model.findOne({
      where: {
        sdt,
      },
    });

    if (nguoiDung) {
      const isAuth = bcryptjs.compareSync(matKhau, nguoiDung.matKhau);
      if (isAuth) {
        //t???o JWT
        const payload = {
          id: nguoiDung.id,
          sdt: nguoiDung.sdt,
          vaiTro: nguoiDung.vaiTro,
        };
        const secretKey = process.env.SECRETKEY;
        const token = jwt.sign(payload, secretKey);

        res.status(200).send({
          message: "????ng nh???p th??nh c??ng",
          token,
        });
      } else {
        res.status(400).send({
          message: "M???t kh???u kh??ng ????ng",
        });
      }
    } else {
      res.status(404).send({
        message: "S??t kh??ng ????ng.",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const caiLaiMatKhau = async (req, res) => {
  try {
    const { sdt } = req.body;
    //T???o chu???i k?? t??? b???t k??
    const matKhauMacDinh = crypto.randomBytes(10).toString("hex");

    const chiTietGiaSu = await GiaSu.findOne({
      where: {
        sdt,
      },
    });

    if (chiTietGiaSu) {
      const salt = bcryptjs.genSaltSync(10);
      const hashPassword = bcryptjs.hashSync(matKhauMacDinh, salt);

      chiTietGiaSu.matKhau = hashPassword;
      await chiTietGiaSu.save();
      res.status(200).send({
        messages: `Reset m???t kh???u th??nh c??ng. V??o email ${chiTietGiaSu.email} ????? nh???n m???t kh???u m???i.`,
        matKhauMoi: matKhauMacDinh,
      });
    } else {
      res.status(404).send({
        messages: "S??T kh??ng ch??nh x??c",
      });
    }

    // G???i mail v???i SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      from: {
        name: "Gia s?? M???n Ti???p",
        email: "tunguyen@giasumantiep.com",
      },
      to: chiTietGiaSu.email,
      subject: "Reset m???t kh???u th??nh c??ng",
      text: "Kh??ng bi???t s??? d???ng ????? l??m g??",
      html: `M???t kh???u m???i c???a b???n l?? <strong>${matKhauMacDinh}</strong>`,
    };

    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    res.status(500).send(error);
  }
};

const dangNhapBangFacebook = async (req, res) => {
  try {
    const token = await jwt.sign(
      { id: req.user.dataValues.id },
      process.env.SECRETKEY
    );
    res.send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  dangKiNguoiHoc,
  dangKiGiaSu,
  dangNhap,
  caiLaiMatKhau,
  dangNhapBangFacebook,
};
