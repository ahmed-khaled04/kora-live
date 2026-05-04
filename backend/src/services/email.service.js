import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPredictionScoredEmail = async (recipient, points, match) => {
  const { homeTeam, awayTeam, homeScore, awayScore } = match;

  const pointsColor = points === 5 ? "#16a34a" : points === 2 ? "#d97706" : "#dc2626";
  const pointsLabel =
    points === 5 ? "Exact Score" : points === 2 ? "Correct Outcome" : "Better luck next time";
  const resultLine =
    points > 0
      ? `You predicted the match correctly and earned <strong style="color:${pointsColor}">${points} point${points !== 1 ? "s" : ""}</strong>.`
      : `Your prediction didn't hit this time — keep going!`;

  await resend.emails.send({
    from: "Kora <onboarding@resend.dev>",
    to: recipient,
    subject: points > 0 ? `+${points} pts — Your prediction was scored!` : "Match result is in",
    text: `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}\n\n${points > 0 ? `You earned ${points} point(s). Keep it up!` : "Your prediction didn't hit this time — keep going!"}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Prediction Result</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:3px;color:#e0e7ff;text-transform:uppercase;">Kora</p>
              <h1 style="margin:12px 0 0;font-size:26px;font-weight:700;color:#ffffff;">Prediction Result</h1>
            </td>
          </tr>

          <!-- Match result -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;color:#94a3b8;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding-bottom:20px;">
                    Final Score
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;padding:20px 0;">
                      <tr>
                        <td width="40%" style="text-align:center;padding:0 12px;">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#f1f5f9;">${homeTeam}</p>
                        </td>
                        <td width="20%" style="text-align:center;">
                          <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:2px;">${homeScore} <span style="color:#475569;">–</span> ${awayScore}</p>
                        </td>
                        <td width="40%" style="text-align:center;padding:0 12px;">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#f1f5f9;">${awayTeam}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Points badge -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border-left:4px solid ${pointsColor};">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#64748b;">${pointsLabel}</p>
                    <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${resultLine}</p>
                  </td>
                  ${
                    points > 0
                      ? `<td style="padding:20px 24px 20px 0;text-align:right;white-space:nowrap;">
                      <span style="font-size:32px;font-weight:800;color:${pointsColor};">+${points}</span>
                      <span style="font-size:14px;color:#64748b;margin-left:4px;">pts</span>
                    </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="#" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;">
                View Leaderboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #334155;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#475569;">You're receiving this because you made a prediction on Kora.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
};
