# Website Browser

A web-based browser with user authentication, subscription plans, and manual payment authorization. Features include:

- **Free Users**: Limited to 5 searches per hour.
- **Home Tester ($5/month)**: Unlimited searches, HTTPS, input sanitization.
- **All Day User ($15/month)**: Unlimited searches, rate limiting, XSS protection, Content Security Policy (CSP).
- **Admin (`ethangamer492@gmail.com`)**: Unlimited searches, view all users, approve/reject payment requests, view search logs.

This guide explains how to set up and run the application on localhost (Linux) and deploy it on Render.

## Project Structure
