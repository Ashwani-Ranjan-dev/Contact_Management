
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            maxlength: 254
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        address: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        company: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
