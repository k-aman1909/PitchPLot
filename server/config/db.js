import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pitchplot';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fallback if MongoDB isn't running locally
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn(`[PitchPlot Server] Operating in Local Storage Engine Mode (Mongoose active or fallback ready).`);
    return false;
  }
};
