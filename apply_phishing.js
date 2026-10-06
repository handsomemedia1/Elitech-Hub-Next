const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const data = JSON.parse(fs.readFileSync('all_blogs_dump.json', 'utf8'));

const slug = 'how-to-recognize-and-avoid-phishing-scams-in-nigeria-mo31j9uq';
const post = data.find(p => p.slug === slug);

function formatEditorial(author, pubDate) {
  const pDate = new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const uDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
<div class="editorial-attribution" style="font-size: 0.9em; color: #888; margin-bottom: 2rem; padding: 1rem; background: rgba(255,255,255,0.05); border-left: 3px solid #06b6d4; border-radius: 4px;">
  <p style="margin: 0 0 0.25rem 0"><strong>Written by:</strong> ${author}</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Edited by:</strong> Elijah Adeyeye, Founder, Elitech Hub</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Originally published:</strong> ${pDate}</p>
  <p style="margin: 0"><strong>Last updated:</strong> ${uDate}</p>
</div>
`;
}

const htmlContent = `<h2>What is Phishing and Why is it Everywhere in Nigeria?</h2>
<!-- IMAGE: Hero (context) - A typical Nigerian smartphone screen showing a suspicious SMS or WhatsApp message from a fake bank representative, next to a padlock icon. -->
<p>If you have a bank account, an email, or a smartphone in Nigeria, you have almost certainly been targeted by a phishing scam. You might not have realized it at the time. It usually starts with a simple text message, an email, or a sudden phone call. The person on the other end sounds professional or urgent. They might claim to be from GTBank, MTN, or even a popular delivery service.</p>
<p>Phishing is an online theft technique that aims to trick victims into revealing their personal information. The attackers don't want to break through complex firewalls or hack into highly secured banking servers—that takes too much time and skill. Instead, they try to trick <em>you</em> into handing over the keys to the front door.</p>
<p>Cybercriminals are becoming more advanced, and many Nigerians fall victim to these tricks every single day. They know our habits, our fears, and the apps we use daily. Understanding how to identify phishing attacks and protect yourself online is no longer optional—it is absolutely essential for your financial survival.</p>
<p>To understand exactly how these scammers operate, let's look at a real, personal experience.</p>

<h2>Real-Life Example: The Opay OTP Scam</h2>
<p>I was sleeping when I received a call asking if I had ordered an Opay physical card. I said no. They then told me I was eligible for a "free Opay card" and that it would be delivered to me.</p>
<p>They asked for my phone number and address, which I provided.</p>
<p>Shortly after, they said I would receive a verification code. I received it and read it out to them. They said it didn't work and sent another one. I also shared that second code.</p>
<p>They thanked me and ended the call.</p>
<p>I went back to sleep.</p>
<p>When I woke up, my account was empty.</p>
<p>This is exactly how phishing works in the real world. Scammers don't always hack systems; they manipulate people. They create urgency, offer fake rewards, and trick you into sharing sensitive information like One-Time Passwords (OTPs). </p>
<p>Here are the key takeaways from this experience:</p>
<ul>
    <li>Never share OTP codes with anyone, not even someone claiming to be a bank official.</li>
    <li>"Free gifts" and urgent phone calls are common scam tactics designed to lower your guard.</li>
    <li>Once a code is shared, your account can be accessed immediately.</li>
</ul>
<p>Stay alert. One small mistake can lead to total loss.</p>

<h2>Common Types of Phishing Attacks in Nigeria</h2>
<p>The Opay trick is just one method. Attackers customize their scams based on what is currently popular in the country. Here are the most common phishing methods you will encounter in Nigeria:</p>

<h3>1. The Bank Impersonation Call</h3>
<p>You get a call from someone claiming to be customer care from Access Bank, Zenith Bank, or GTBank. They tell you your account has an issue, perhaps an unauthorized debit, or your BVN needs updating. They then ask you for your ATM card pin, full card number, or the OTP they just sent to your phone. Remember: No Nigerian bank will ever call you to ask for your PIN or OTP. If there is a genuine issue, they will tell you to visit the nearest branch.</p>

<h3>2. Telecom and SIM Swap Tricks</h3>
<p>Scammers often impersonate MTN, Airtel, or Glo representatives. They might call you to say your NIN is not properly linked and your line will be blocked in 24 hours. They send you a code and ask you to call it out. This code is often the authorization needed to initiate a SIM swap or access your mobile money wallet. Once they control your phone number, they control every bank account linked to it.</p>

<h3>3. WhatsApp Hijacking</h3>
<p>You receive a message from a friend or family member's WhatsApp account (which has already been hacked). They urgently need money for a medical emergency or ask you to join a highly profitable investment group. Sometimes, they just ask you to forward an SMS code you are about to receive. If you send that code, your WhatsApp account will also be hijacked, and they will use it to scam your contacts.</p>

<h3>4. Facebook Marketplace Scams</h3>
<p>If you sell items on Facebook or Jiji, scammers might contact you showing interest. They send a fake payment receipt that looks real, or they send a link claiming you need to log in to your bank through their "secure payment portal" to receive the funds. Once you enter your login details on that fake portal, they steal your money.</p>

<h2>Real-Life Example: The Fake Email Threat</h2>
<!-- IMAGE: Educational (explanation) - A side-by-side comparison of a real bank email and a fake phishing email, highlighting the suspicious sender address, misspelled words, and urgent tone. -->
<p>Phone calls aren't the only way scammers reach you. I opened my email and saw a message sitting quietly in my inbox:</p>
<p><strong>"Urgent: Verify Your Account Immediately"</strong></p>
<p>Something felt off, but I clicked anyway.</p>
<p>The email said I needed to confirm my details to avoid "account suspension." There was a link attached.</p>
<p>First red flag: the message had no clear context. I wasn't told why I was being contacted or which service it was about.</p>
<p>I kept reading.</p>
<p>The sender's name looked real, but the email address was strange—slightly misspelled. That was my second warning sign.</p>
<p>Then I noticed the file they attached (instead of proper instructions). It was named something like "update_final_final.doc". That didn't look professional at all.</p>
<p>Out of curiosity, I hovered over the link. The website address didn't match the official company site. It looked fake.</p>
<p>At that moment, everything made sense. Phishing doesn't always look dangerous. It looks normal—but slightly "off."</p>
<p>Here is what gave it away:</p>
<ul>
    <li>No clear context in the message.</li>
    <li>Suspicious sender details.</li>
    <li>Fake-looking website link.</li>
    <li>Too much urgency without explanation.</li>
</ul>
<p>I didn't click again. Because in phishing, the goal is simple: rush you into a mistake before you notice the signs.</p>

<h2>How to Recognize a Phishing Attack Before You Click</h2>
<p>The attackers rely on speed and panic. If you slow down and look closely, they almost always leave clues. Here is exactly what you should check:</p>
<ul>
    <li><strong>Check the Sender's Real Address:</strong> Do not just look at the display name. Tap or hover over the name to see the actual email address. An email from GTBank will end in @gtbank.com, not gtbank.customerservice123@gmail.com.</li>
    <li><strong>Look for Bad Grammar and Spelling:</strong> While scammers are getting better, many phishing messages still contain strange phrasing, bad grammar, or misspelled words.</li>
    <li><strong>Hover Before You Click:</strong> If there is a link, hover your mouse over it (or long-press on a phone) without clicking. A small box will pop up showing the actual destination URL. If the email says it goes to your bank but the link points to a strange address, it is a scam.</li>
    <li><strong>Beware of the "Urgency" Trap:</strong> Scammers use words like "Immediate Action Required," "Account Suspended," or "Final Warning." They want you to panic and act without thinking. Real organizations will give you time to resolve issues.</li>
    <li><strong>Unexpected Attachments:</strong> Never open unexpected attachments, especially from people you don't know. Files ending in .doc, .exe, or .zip can contain malware that steals information from your computer or phone.</li>
</ul>

<h2>Practical Steps to Protect Yourself</h2>
<p>Knowing what phishing looks like is the first step, but you also need to set up defenses so that even if you make a mistake, the attackers cannot get in.</p>

<h3>1. Turn on Two-Factor Authentication (2FA) Everywhere</h3>
<p>Enable 2FA on your email, WhatsApp, Facebook, and banking apps. This means that even if a scammer gets your password, they still need a secondary code (usually sent via a dedicated authenticator app or SMS) to log in. And remember, <em>never share that code!</em></p>

<h3>2. Never Click Links in Unsolicited Messages</h3>
<p>If you get an email or SMS saying your account has an issue, do not click the link provided. Instead, open your browser, type in the bank's official website yourself, or open your banking app directly to check.</p>

<h3>3. Use Anti-Phishing Tools</h3>
<p>If you are a professional or handle a lot of emails, you can use online tools to check if links or emails are safe. For example, you can use <a href="https://mxtoolbox.com" rel="noopener noreferrer" target="_blank" style="color: #06b6d4; text-decoration: underline;">MxToolbox.com</a> to verify email headers and domains to ensure they are coming from legitimate sources.</p>

<h3>4. Slow Down</h3>
<p>The biggest weapon you have against a scammer is time. When you receive an alarming call or message, take a deep breath. Tell the person on the phone, "I am busy right now, I will walk into the branch later," and hang up. A real customer care agent will not force you to stay on the line.</p>

<h2>What to Do If You've Already Been Scammed in Nigeria</h2>
<!-- IMAGE: Decision (practical action) - A simple flowchart showing the immediate steps to take if scammed: Lock account -> Contact Bank -> Report to Authorities. -->
<p>If you realize you have clicked a bad link, given out an OTP, or transferred money to a scammer, do not panic. Time is critical, and acting fast can sometimes reverse the damage.</p>

<h3>1. Block Your Account Immediately</h3>
<p>Most Nigerian banks have a USSD code you can dial from any phone to block your account or ATM card immediately (e.g., *737*51*74# for GTBank). Memorize your bank's emergency USSD code or write it down somewhere safe. If you don't know the code, transfer your remaining funds to a safe account if possible, or use your banking app to block your card and account.</p>

<h3>2. Contact Your Bank</h3>
<p>Call your bank's official customer care line or reach out to them on their verified X (formerly Twitter) handles. Report the fraudulent transaction. If you act quickly enough, the bank might be able to place a lien on the receiving account before the scammer withdraws the money.</p>

<h3>3. Report the Incident to the Authorities</h3>
<p>Many people skip this step thinking nothing will happen, but reporting helps law enforcement track down these networks. You can report phishing attempts and cyber fraud in Nigeria to:</p>
<ul>
    <li>The <strong>Nigeria Police Force National Cybercrime Center (NPF-NCCC)</strong> via their portal at <a href="https://incb.npf.gov.ng" rel="noopener noreferrer" target="_blank" style="color: #06b6d4; text-decoration: underline;">incb.npf.gov.ng</a> or by calling +2349168343711.</li>
    <li>The <strong>Economic and Financial Crimes Commission (EFCC)</strong> by sending an email to <a href="mailto:info@efcc.gov.ng" style="color: #06b6d4; text-decoration: underline;">info@efcc.gov.ng</a>.</li>
    <li>Use the Scamwatch Nigeria platform for reporting.</li>
</ul>

<p>Phishing works because we are all busy, stressed, and easily distracted. By learning how these scammers operate in Nigeria, understanding their tricks, and taking simple protective steps, you can keep your money and your data safe.</p>

<p><em>Want to strengthen your team's cybersecurity awareness? Explore Elitech Hub's <a href="/services/corporate-training" style="color: #06b6d4; font-weight: bold; text-decoration: underline;">Corporate Cybersecurity Training</a>.</em></p>
`;

const finalContent = formatEditorial(post.author, post.published_at) + htmlContent;

async function run() {
  const res = await fetch(`${url}/rest/v1/blog_posts?id=eq.${post.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ content: finalContent, word_count: 1250, updated_at: new Date().toISOString() })
  });
  console.log(`Updated phishing article: ${res.status}`);
}
run().catch(console.error);
