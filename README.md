# GitLab Time Report

This is a chrome extension used to generate **realtime** (thanks for Firebase) spent time report for gitlab issues and projects.

## What can it do

(I use the asterisk to hide the real information.)

1. A realtime report for a single issue in each issue page

   ![](./art/issue-report.png)

   ![](./art/issue-report.gif)

1. A realtime report for all projects/users in a dashboard page

   ![](./art/dashboard-projects-users.png)

1. A realtime report for all issues of a project in a dashboard page

   ![](./art/dashboard-project-issues.png)

   ![](./art/dashboard.gif)

1. A shortcut button to log today's spent time to resolve the timezone problem if your gitlab server deploys in another far timezone

   ![](./art/log-today-spent-time.gif)

## How to start

TODO

## Notes

TODO:

How to implement this extension step by step, includes:

- Config multiple js entries by Webpack
- Use TypeScript
- Make it as a chrome extension
- Login/Signup with Firebase Auth
- Store data to Firebase Firestore
