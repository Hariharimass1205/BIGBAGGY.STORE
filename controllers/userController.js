const userCollection = require("../Model/userModel.js")
const orderCollection = require("../Model/orderModel.js")
const walletCollection = require("../Model/walletModel.js")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const formatDate = require("../service/dateFormate.js")






const landingPagefn = (req, res) => {
  req.session.userInfo
  req.session.userinfosignin
  req.session.userName
  req.session.isBlocked = false
  res.render("user/landingpage", { userInfo: req.session.userInfo, userName: req.session.userName })
}

const loginPagefn = async (req, res) => {
  res.render("user/login", { userInvalid: req.session.userInvalid, isBlocked: req.session.isBlocked })
  req.session.userInvalid = false
  req.session.isBlocked = false
  req.session.save()
}


const logincheckfn = async (req, res) => {
  const Email = req.body.Email
  const Password = req.body.Password
  const userCheck = await userCollection.findOne({ email: Email, isBlocked: false })
  if (userCheck) {
    const passCheck = await bcrypt.compare(Password, userCheck.Password)
    if (passCheck) {
      req.session.userName = userCheck.fname + userCheck.lname
      req.session.userInfo = userCheck;
      req.session.email = userCheck.email
      res.redirect("/")
    } else {
      req.session.userInvalid = true
      req.session.signsuccess = false
      res.redirect("/login")
    }
  } else {
    req.session.isBlocked = true
    req.session.userInvalid = true
    req.session.signsuccess = false
    res.redirect("/login")
  }
}

const logoutfn = (req, res) => {
  req.session.userInvalid = false
  req.session.userName = false
  req.session.userInfo = false
  res.redirect("/")
}

const sign2login = (req, res) => {
  req.session.signsuccess = true
  res.redirect("/login")
}

const signupPagefn = (req, res) => {
  try {
    req.session.emailExist;
    req.session.userNumber;
    req.session.referalCodeuseage = req.query
    res.render("user/signup", { emailExist: req.session.emailExist, userNumber: req.session.userNumber })
    req.session.emailExist = false
    req.session.userNumber = false
    req.session.save()
  } catch (err) {
    console.log(`Error from signup ${err}`)
  }
}


//sign up validation and otp send
const signupfn = async (req, res) => {
  let exist = req.body.Email;
  let existNumber = req.body.Phone
  try {
    const user = await userCollection.findOne({ email: exist });
    const userNumber = await userCollection.findOne({ Phone: existNumber });
    if (!user && !userNumber) {
      const Password = await bcrypt.hash(req.body.Password, 10);
      const confirmPass = await bcrypt.hash(req.body.confirmPass, 10);
      const userDetail = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.Email,
        Password: Password,
        confirmPass: confirmPass,
        Phone: req.body.Phone
      };
      req.session.userInfo = userDetail;
      const otp = await emailOtp(req.body.Email)
      req.session.otp = otp
      console.log(otp)
      const userdetails = req.session.userInfo
      req.session.userName = userdetails.fname
      req.session.islogin = false
      res.render("user/otppage");
    } else {
      req.session.emailExist = true;
      req.session.userNumber = true;
      res.redirect("/signup");
    }
  } catch (error) {
    console.error(`Error checking email existence: ${error}`);
    res.status(500).send("Internal Server Error");
  }
};



const optVerify = async (req, res) => {
  const otp = req.session.otp
  if (otp === Number(req.body.otp)) {
    const userdetails = req.session.userInfo
    const ReferalCode = Math.random().toString(36).substring(2,9);//referal code
    const {fname,lname,email,Password,confirmPass,Phone} = userdetails
    await userCollection({fname,lname,email,Password,confirmPass,Phone,ReferalCode}).save()
    if(req.session.referalCodeuseage)
    {
      const referalUser = await userCollection.findOne({ReferalCode:req.session?.referalCodeuseage?.referralCode})
      await walletCollection.updateOne({userId:referalUser._id},{$inc:{walletBalance:500}})

    }
    req.session.userName = userdetails.fname + userdetails.lname
    req.session.email = userdetails.email
    req.session.islogin = true
    const userDetail = await userCollection.findOne({email:userdetails.email})
    await walletCollection.create({userId : userDetail._id })
    req.session.userInfo = userDetail
    res.redirect("/")
  } else {
    res.render("user/otppage", { invalidotp: "OTP Invalid" })
  }
}




const forgetpage1fn = (req, res) => {
  try {
    req.session.forEmailExsit 
    res.render("user/forgetpage1",{EmailExsit:req.session.forEmailExsit })
    
  } catch (error) {
    console.log(error)
  }
}



const forgetpage2fn = async (req, res) => {
  try {
    const forgetEmail = req.body.email
    const emailcheck = await userCollection.findOne({email:forgetEmail})
    if(emailcheck){
    req.session.forgetEmail = req.body.email
    const otp = await Passresetotp(forgetEmail)
    req.session.resetopt = otp
    req.session.forEmailExsit  = false
    res.render("user/forgetpage2")
    }else{
      req.session.forEmailExsit = true
      res.redirect("back")
    }
  } catch (error) {
    console.log(error)
  }
}



const forgetpage3fn = (req, res) => {
  try {
    const otp = Number(req.body.resetotp)
    const ourotp = req.session.resetopt
    if (otp === ourotp) {
      res.render("user/forgetpage3")
    } else {
      req.session.resetotpinvalid = true
      res.render("user/forgetpage2")
    }
  } catch (error) {
    console.log(error)
  }
}



const forgetpage4fn = async (req, res) => {
  const newpass = req.body.NewPassword
  const email = req.session.forgetEmail
  const user = await userCollection.findOne({ email: email });
  const passwordHash = await bcrypt.hash(newpass, 10);
  const newfeild = await userCollection.findByIdAndUpdate(
    { _id: user._id },
    {
      $set: { Password: passwordHash }
    })
  res.redirect("/login")
}

 

//render into otp function for signup
const insertUser = async (req, res) => {
  const email = req.session.forgetEmail;
  let otp = await resentotp(email);
  req.session.otp1 = otp;
  res.render("user/otppage");
};


// callback fn for otp
const emailOtp = async (email) => {
  try {
    const emailID = email;
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "hariharimass1205@gmail.com",
        pass: "fagn tumb wdcc lyjt",
      },
    })
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: "hariharimass1205@gmail.com",
      to: emailID,
      subject: "OTP Verification",
      text: `Your OTP IS:${otp}`,
    };
    //Send the email
    let mail = await transport.sendMail(mailOptions);
    return otp
  } catch (err) {
    console.log(`Error from emailOtp router ${err}`);
  }
};

// password reset otp fn
const Passresetotp = async (email) => {
  try {
    const emailID = email;
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "hariharimass1205@gmail.com",
        pass: "fagn tumb wdcc lyjt",
      },
    })
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: "hariharimass1205@gmail.com",
      to: emailID,
      subject: "Reset Password",
      text: `Your One Time Otp is = ${otp}`,
    };
    console.log(otp)
    //Send the email
    let mail = await transport.sendMail(mailOptions);
    return otp
  } catch (err) {
    console.log(`Error from emailOtp router ${err}`);
  }
};


const userProfilefn = async (req, res) => {
  try {
    const currentUser = req.session.userInfo
    const walletBalance = await walletCollection.findOne({userId:currentUser._id})
    const userInfo = await userCollection.findById({ _id: currentUser._id })
    res.render("user/Profilepage", { userInfo , walletBalance:walletBalance })
  } catch (error) {
    console.log(error);
  }
}

const ProfileEditpage = async (req, res) => {
  try {
    const currentUser = req.session.userInfo
    const userInfo = await userCollection.findById({ _id: currentUser._id })
    res.render("user/editProfile", { userInfo })
  } catch (error) {
    console.log(error)
  }
}

const postEditprofilefn = async (req, res) => {
  try {
    const newUser = {
      fname: req.body.fname,
      lname: req.body.Lname,
      Phone: req.body.Phone,
    };
    const updateduser = await userCollection.findByIdAndUpdate({ _id: req.params.id }, newUser);
    res.redirect("/Profile");
  } catch (error) {
    console.error(error);
  }
}

const passChange = async (req, res) => {
  try {
    res.render("user/passChange", {
      invalidCurrentPassword: req.session.invalidCurrentPassword,
    });
  } catch (error) {
    console.error(error);
  }
}

const PostpassChange = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = req.session.userInfo

    const comparePass = bcrypt.compareSync(currentPassword, user.Password)

    if (comparePass) {
      const encrypted = bcrypt.hashSync(newPassword, 10)
      await userCollection.findByIdAndUpdate(
        { _id: user._id },
        { $set: { Password: encrypted } }
      );
      res.json({ success: true });
    } else {
      res.send({invalidPassword: true})
    }
    
  } catch (error) {
    console.error(error);
  }
}


module.exports = {
  logincheckfn,
  userProfilefn,
  forgetpage1fn,
  forgetpage2fn,
  forgetpage4fn,
  insertUser,
  forgetpage3fn, 
  sign2login, 
  landingPagefn, 
  logoutfn, 
  loginPagefn,
  signupPagefn,
  signupfn,
  optVerify,
  ProfileEditpage,
  passChange,
  PostpassChange,
  postEditprofilefn,
}
