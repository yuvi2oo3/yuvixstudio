/**
 * ================================================================
 * YUVIX STUDIO — Contact form backend (Google Sheets + Gmail)
 * ================================================================
 *
 * WHAT THIS DOES
 * Every time someone submits the contact form on your website,
 * this script:
 *   1. Adds a new row to a "Submissions" sheet (your database)
 *   2. Sends you an email straight from your own Gmail account
 *
 * ----------------------------------------------------------------
 * SETUP STEPS (one-time, takes about 5 minutes)
 * ----------------------------------------------------------------
 * 1. Go to https://sheets.google.com and create a new blank sheet.
 *    Name it anything, e.g. "Yuvix Studio — Enquiries".
 *
 * 2. In that sheet, click Extensions > Apps Script.
 *
 * 3. Delete anything in the editor and paste this ENTIRE file in
 *    its place.
 *
 * 4. On line ~44 below, replace "youremail@gmail.com" with the
 *    Gmail address you want enquiries sent to (can be the same
 *    Google account, or a different one).
 *
 * 5. Click Deploy > New deployment.
 *      - Click the gear icon next to "Select type" and choose "Web app".
 *      - Description: anything (e.g. "Contact form v1").
 *      - Execute as: Me.
 *      - Who has access: Anyone.
 *      - Click Deploy.
 *
 * 6. Google will ask you to authorize the script (it needs
 *    permission to edit this sheet and send email on your behalf).
 *    Click through "Authorize access" > pick your account >
 *    "Advanced" > "Go to (project name) (unsafe)" > Allow.
 *    This warning is normal for personal scripts you wrote yourself.
 *
 * 7. Copy the "Web app URL" it gives you — it looks like:
 *    https://script.google.com/macros/s/AKfycb.../exec
 *
 * 8. Paste that URL into BOTH index.html and services.html, replacing
 *    YOUR_SCRIPT_URL in the contact form's action attribute.
 *
 * 9. Test it: submit the form on your live site, then check your
 *    Gmail inbox and the "Submissions" tab in your sheet.
 *
 * ----------------------------------------------------------------
 * IMPORTANT: if you ever edit this script again, you must create a
 * NEW deployment (Deploy > Manage deployments > pencil icon > New
 * version) for the changes to actually go live. Editing the code
 * alone does not update the existing /exec URL.
 * ================================================================
 */

// TODO: replace with the Gmail address that should receive enquiries
const NOTIFY_EMAIL = "youremail@gmail.com";

const SHEET_NAME = "Submissions";

function doPost(e) {
  try {
    const params = e.parameter;

    // Honeypot check — if this hidden field has anything in it,
    // it was filled in by a bot, so silently ignore the submission.
    if (params._gotcha) {
      return jsonResponse({ result: "ignored" });
    }

    const name = (params.name || "").toString().trim();
    const email = (params.email || "").toString().trim();
    const message = (params.message || "").toString().trim();

    if (!name || !email || !message) {
      return jsonResponse({ result: "error", error: "Missing required fields" });
    }

    // --- 1. Save to the sheet ---
    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), name, email, message]);

    // --- 2. Email notification via your Gmail ---
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: "New enquiry from Yuvix Studio website — " + name,
      body:
        "You have a new enquiry from your website contact form.\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        "Message:\n" + message + "\n\n" +
        "— Reply to this email to respond directly to " + name + "."
    });

    return jsonResponse({ result: "success" });

  } catch (err) {
    return jsonResponse({ result: "error", error: err.toString() });
  }
}

// Lets you open the /exec URL directly in a browser to confirm it's deployed
function doGet(e) {
  return ContentService
    .createTextOutput("Yuvix Studio contact form endpoint is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Email", "Message"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
