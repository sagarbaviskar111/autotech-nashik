# Certificate Verification - Google Sheet Setup

## 1. Sheet
Sheet ready hai: **Autotech Nashik - Certificates** (aapke Google Drive me).
https://docs.google.com/spreadsheets/d/12vYCAeZ-9uW4PEaFe-zONEeKsJWSYA1C1pH2syLk1rY/edit

Pehli row me ye headings hain (inhe mat badlo):

| Certificate ID | Name | Course | Duration | Assigned Date |
|---|---|---|---|---|
| 24AN038S | Rahul Patil | PLC & SCADA | 3 Months | 2024-08-15 |

- Har naya certificate = ek nayi row.
- **Certificate ID zaroori hai.** Baaki columns (Name, Course, Duration, Assigned Date) khali ho sakte hain - jo khali hoga wo website par dikhega hi nahi, baaki dikhega.
- Date `2024-08-15` likhoge to website par "15 August 2024" dikhegi. Kuch aur format likhoge to jaisa likha waisa hi dikhega.
- Column ke headings ke ye naam bhi chalte hain: `Student Name`, `Certificate No`, `Course Name`, `Issue Date`...

## 2. Sheet ko website se jodna (sirf ek baar)
1. Sheet me: **File -> Share -> Publish to web**
2. Pehle dropdown me **Sheet1** chuno, doosre me **Comma-separated values (.csv)** chuno.
3. **Publish** dabao -> link copy karo. Link aisa hoga:
   `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`
4. (Ho chuka hai - link `js/certificate.js` me laga diya gaya hai.)
5. Push kar do. Ho gaya.

Uske baad sheet me nayi row add karoge to website par apne aap (kuch minute me) verify hone lagegi - dobara push karne ki zarurat nahi.

## 3. QR code
Har certificate ke QR me ye link rakho:
`https://autotechnashik.in/certificate.html?id=CERTIFICATE_ID`

## Dhyan
- "Publish to web" ke baad sheet ka data public ho jata hai. Isme sirf naam, course, duration aur date rakho. Phone number, address ya marks mat daalo.
- Published sheet ko band karna ho: File -> Share -> Publish to web -> **Stop publishing**.
- Sheet me ID ke aage-peeche space ya small/capital letters ka farak nahi padta.
