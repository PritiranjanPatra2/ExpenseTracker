import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from 'dotenv/config'

const sender=process.env.user;
const pass=process.env.pass;
export const registerControllers = async (req, res, next) => {
    try{
        console.log(sender,pass);
        
        const {name, email, password} = req.body;

        // console.log(name, email, password);

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }


        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: sender,
              pass: pass,
            },
          });
          const emailTemplate = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #007bff; padding: 15px; color: white; text-align: center;">
      <h2>Welcome to Expense Tracker!</h2>
    </div>
    <div style="padding: 20px;">
      <p>Hello ${email},</p>
      <p>Thank you for signing up for <strong>Expense Tracker</strong>. Manage your expenses effortlessly and stay in control of your finances.</p>
      <p>Start tracking now and make smarter financial decisions!</p>
      <p style="margin-top: 20px;">Happy Tracking!<br/>The Expense Tracker Team</p>
    </div>
    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
      <p>&copy; 2024 Expense Tracker. All rights reserved.</p>
      <p>
        <a href="#" style="color: #007bff; text-decoration: none;">Privacy Policy</a> |
        <a href="#" style="color: #007bff; text-decoration: none;">Support</a>
      </p>
    </div>
  </div>
`;

    const info = await transporter.sendMail({
        from: '"Patra Expense Tracker Team" <patrapritiranjan957@gmail.com>',
        to: email,
        subject: "Welcome to Expense Tracker App",
        text: `Hello ${email},\n\nThank you for signing up for Expense Tracker. Manage your expenses effortlessly and stay in control of your finances.\n\nHappy Tracking!\nThe Expense Tracker Team`,
        html: emailTemplate,
    });

    // console.log("Email Sent Info:", info);




        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // console.log(hashedPassword);

        let newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: newUser
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

}
export const loginControllers = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        // console.log(email, password);
  
        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }); 
        }
    
        const user = await User.findOne({ email });
    
        if (!user){
            return res.status(401).json({
                success: false,
                message: "User not found",
            }); 
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email or Password",
            }); 
        }

        delete user.password;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user,
        });

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{

        const userId = req.params.id;
       
        const imageData = req.body.image;
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
          });


    }catch(err){
        next(err);
    }
}

export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}