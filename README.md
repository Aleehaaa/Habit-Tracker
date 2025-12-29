Habit Tracker - Setup Guide for Windows
What You Need to Install
1. Node.js
Go to https://nodejs.org
Download the Windows version (LTS recommended)
Run the installer
Click Next, Next, Next until finished
Restart your computer
2. MongoDB (Local Database)
Go to https://www.mongodb.com/try/download/community
Download MongoDB Community Server for Windows
Run the installer
Choose "Complete" installation
Check the box "Install MongoDB as a Service"
Click Install
MongoDB will start automatically
Setup Steps
Step 1: Extract the Files
Right-click the zip file
Click "Extract All"
Choose a location like Desktop or Documents
Click Extract
Step 2: Open Command Prompt
Open the extracted folder
Hold Shift and right-click in the empty space
Click "Open PowerShell window here" or "Open Command Prompt here"
Step 3: Install Packages
Type this command and press Enter:
Wait for 2-3 minutes. You will see lots of text. This is normal.
Step 4: Check the .env File
Open the .env file with Notepad
Make sure it looks like this:
Save and close
Step 5: Start the Application
Type this command and press Enter:
You should see:
Step 6: Open in Browser
Open Google Chrome or any browser
Type in the address bar: localhost:3000
Press Enter
The application will open
Using the Application
First Time Use
1. You will see the landing page
npm install
MONGODB_URI=mongodb://localhost:27017/habittracker
SESSION_SECRET=your-secret-key
PORT=3000
npm start
Server running on http://localhost:3000
Connected to MongoDB
2. Click "Sign In" or "Sign Up"
3. For new account, enter:
Username (example: john)
Email (example: john@email.com)
Password (minimum 6 characters)
4. Click "Create Account"
5. You will automatically login
Daily Use
1. Open browser and go to localhost:3000
2. Click "Sign In"
3. Enter your email and password
4. Start tracking your habits
Using the Extra Features (Complimentary)
Habit Streak Counter
Complete a habit every day
You will see "5 day streak" appear automatically
Keeps you motivated to continue
Export Your Data
Click "Export Data" button at the top
Click "Download CSV" to open in Excel
Or click "Download JSON" for backup
File saves to your Downloads folder
Dark Mode
Look at bottom-right corner
Click the moon button
Colors change to dark theme
Click sun button to go back to light
Your choice is remembered
User Profile
Click your name at the top
See your statistics:
How many habits you track
Total completions
Your best streak
Click "Close" or click outside to exit
Project Files
Common Problems and Solutions
Problem: "npm is not recognized"
Solution:
Node.js is not installed properly
Install Node.js again
Restart computer
Try again
Problem: Cannot connect to MongoDB
Solution:
Open Services (search in Windows Start menu)
Find "MongoDB" in the list
Right-click and select "Start"
habit-tracker/
├── server.js (Main program file)
├── package.json (List of required packages)
├── .env (Settings file)
└── public/ (Website files)
 ├── index.html (Home page)
 ├── allhabits.html (Main tracker)
 ├── contactus.html (Contact form)
 └── blog.html (Blog page)
Try running the app again
Problem: Port 3000 is already in use
Solution:
Close other programs
Or open .env file
Change PORT=3000 to PORT=3001
Save file
Run npm start again
Open localhost:3001 in browser
Problem: Page not loading
Solution:
Make sure you typed localhost:3000 correctly
Check if server is running in Command Prompt
Try refreshing the page (press F5)
Stopping the Application
Go to the Command Prompt window
Press Ctrl + C
Type Y and press Enter
Server stops
Starting Again Later
1. Open the project folder
2. Hold Shift and right-click
3. Open Command Prompt
4. Type npm start
5. Open browser to localhost:3000
Important Notes
Keep the Command Prompt window open while using the app
Do not close it or the app will stop
MongoDB must be running (it starts automatically on Windows)
Use a modern browser (Chrome, Edge, Firefox)
What Each File Does
server.js: The brain of the application
.env: Settings like database location
package.json: List of required components
public folder: Contains all the web pages
System Requirements
Windows 7 or newer
4GB RAM minimum
500MB free disk space
Internet connection (only for first-time setup)
Default Settings
Website runs on: localhost:3000
Database name: habittracker
Login session: 24 hours
Minimum password: 6 characters
Getting Help
If something does not work:
1. Check the Command Prompt for error messages
2. Make sure MongoDB service is running
3. Try restarting the computer
4. Check if Node.js is installed: type node --version in Command Prompt
Features Summary
Main Features
Create account and login securely
Track multiple habits daily
View progress weekly, monthly, and yearly
Contact form for feedback
Blog with search
Bonus Features (Complimentary)
Streak counter to stay motivated
Export data to Excel or backup
Dark mode for night use
Profile page with statistics
After Installation
The application stores all data on your computer in MongoDB. No internet needed after setup. Your data stays
private and secure on your machine.
