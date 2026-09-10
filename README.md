# SlideSense - AI Presentation Coach

SlideSense is an AI-powered presentation coaching and viva interview simulation platform.

---

## 💳 Razorpay Test Mode Setup

This project includes a complete end-to-end integration of **Razorpay Payment Gateway in TEST MODE** for the **SlideSense Pro Subscription (₹299/month)**.

> [!NOTE]
> **TEST MODE ONLY**: Payments made during test mode do **NOT** charge real money. All credentials and transactions run using Razorpay's official sandbox test keys.

### 1. Razorpay Account Setup
1. Create or log in to your account at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** using the mode toggle at the top of the Razorpay Dashboard.
3. Navigate to **Account & Settings** -> **API Keys**.
4. Generate/copy your **Key ID** and **Key Secret**.

### 2. Environment Variables Configuration
In `server/.env`, update the following variables:

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

> [!IMPORTANT]
> - `RAZORPAY_KEY_SECRET` remains strictly backend-only and is **never** sent to the client.
> - Ensure `server/.env` is ignored by `.gitignore` and never committed to version control.

### 3. Start Backend & Frontend

#### Backend Server:
```bash
cd server
npm install
npm run dev
```

#### Frontend Client:
```bash
cd client
npm install
npm run dev
```

### 4. Testing the Pro Upgrade Flow in Razorpay Test Mode
1. Open the SlideSense application in your browser (e.g. `http://localhost:5173`).
2. Log in as a user on the **FREE** plan (or register a new user account).
3. Click **"Upgrade to Pro"** in the sidebar, header, or profile page.
4. Review the **Pro Subscription (₹299/month)** card and click **"Upgrade to Pro"**.
5. The backend will invoke `POST /api/payment/create-order` to generate a Razorpay order for ₹299 (29900 paise, INR).
6. The **Razorpay Test Checkout** modal will pop up.
7. Use Razorpay's official Test Card / Test NetBanking / Test UPI credentials:
   - **Test Card Number**: `4111 1111 1111 1111`
   - **Expiry**: Any future date (e.g. `12/30`)
   - **CVV**: `123`
   - **OTP**: `123456`
8. Upon payment completion, Razorpay returns the `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
9. The frontend sends these details to `POST /api/payment/verify`.
10. The backend performs server-side HMAC-SHA256 signature verification using `RAZORPAY_KEY_SECRET`.
11. On verified success:
    - User `plan` changes from `free` to `pro` in the database.
    - Payment log is stored in the `Payment` collection.
    - UI updates immediately to show **PRO** plan status and unlocks unlimited presentation sessions.

---

## 🛡️ Security Best Practices
- **No Secret Exposure**: The frontend only receives the `RAZORPAY_KEY_ID`.
- **Server Verification**: The backend strictly validates payment signatures before upgrading any user.
- **Backend Price Control**: Order amounts (₹299 = 29900 paise) are determined on the backend and cannot be tampered with by the client.
