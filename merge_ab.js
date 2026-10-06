const fs = require('fs');
const a = JSON.parse(fs.readFileSync('article_a.json', 'utf8'));
const b = JSON.parse(fs.readFileSync('article_b.json', 'utf8'));

// Extract the useful bits from B.
// We want: "Which Cybersecurity Domain should you start with?" down to the end.
// A has a nice intro.
const aContent = a.content;
const bContent = b.content;

// Let's create a combined content string.
let combined = aContent;

// Remove the existing laptop links section from A if it's there? Wait, the laptop links were injected into B in the previous session. I should append those to A as well.
const bInject = `

<div style="margin-top: 3rem; padding: 2rem; border-top: 2px solid rgba(255, 255, 255, 0.1);">
  <h2>How to Start Learning Cybersecurity (The 6-Month Practical Roadmap)</h2>
  <p><em>*Note: The following practical roadmap and domain guidance includes contributions originally written by TaiwoEniola.</em></p>

  <h3>Which Domain Should You Start With?</h3>
  <p>Many beginners feel stuck after studying mostly theory. Online advice is confusing—learn Linux, networking, ethical hacking, SOC, and more. People keep jumping from one topic to another without clear direction.</p>
  <p>If you are a beginner in this situation, the best starting points are:</p>
  <ul>
    <li><strong>SOC Analyst (Security Operations Center):</strong> This is usually the best starting point because it is practical and beginner-friendly. You will be working on things like reading logs and monitoring alerts.</li>
    <li><strong>GRC (Governance, Risk, and Compliance):</strong> A great option if you prefer less technical work and enjoy documentation, policies, and ensuring systems meet legal requirements.</li>
  </ul>
  <p><em>Note: Penetration Testing (Ethical Hacking) is not ideal for absolute beginners because it requires a strong technical foundation in how systems work before you can break them.</em></p>

  <h3>What Skills and Tools Should You Focus On First?</h3>
  <p>Before jumping into tools, focus on understanding basic skills:</p>
  <ol>
    <li><strong>Networking Basics:</strong> Learn how data moves on the internet. Focus on TCP/IP, DNS, and HTTP. This helps you understand how devices communicate.</li>
    <li><strong>Operating Systems:</strong> Get comfortable with Linux and Windows. Most cybersecurity work happens inside these systems, so you need to know how they function.</li>
    <li><strong>Basic Security Concepts:</strong> Understand simple ideas like threats, authentication, and encryption. These are the foundation of cybersecurity.</li>
  </ol>
  <p>After that, you can move to tools:</p>
  <ul>
    <li><strong>Wireshark:</strong> helps you see and analyze network traffic.</li>
    <li><strong>Nmap:</strong> used to scan networks and find devices or open ports.</li>
    <li><strong>Splunk:</strong> used to collect and analyze security logs (SIEM tool).</li>
  </ul>
  <p>Learning tools without understanding the basics will only lead to confusion.</p>

  <h3>How Should You Structure Your Learning (6 Months)?</h3>
  <p>Start simple and build step by step.</p>
  <ul>
    <li><strong>Month 1-2:</strong> Focus on fundamentals like networking (TCP/IP, DNS) and basic security concepts. This helps you understand how systems work before trying to secure them.</li>
    <li><strong>Month 3:</strong> Begin hands-on practice using tools like Wireshark and Nmap. The goal is to get comfortable, not perfect.</li>
    <li><strong>Month 4:</strong> Simulate real work by reviewing logs and alerts using platforms like TryHackMe or LetsDefend.</li>
    <li><strong>Month 5:</strong> Build practical projects such as setting up a home lab or reviewing phishing emails. Document your work on GitHub or LinkedIn.</li>
    <li><strong>Month 6:</strong> Prepare for entry-level certifications and start applying for roles.</li>
  </ul>
  <p>Consistency matters more than perfection—steady progress will take you further than rushing through topics.</p>

  <h3>Certifications That Make Sense for Beginners</h3>
  <ul>
    <li><strong>CompTIA Security+:</strong> Covers the overall cybersecurity landscape and is widely recognized.</li>
    <li><strong>CompTIA CySA+:</strong> Focuses more on analysis and is useful if you are targeting SOC roles.</li>
  </ul>
  <p>These certifications help you pass HR filters, but they won't get you the job alone. That is why practical experience is essential.</p>

  <h2>Setting Up Your Cybersecurity Lab Environment</h2>
  <p>Before you can practice most of what we've covered above—running Wireshark, spinning up a Kali Linux environment, or simulating network attacks—you need a machine that can handle it.</p>
  <p>Understanding <a href="/blog/what-laptop-do-i-need-to-learn-cybersecurity" style="color: #06b6d4; text-decoration: underline;">what laptop you actually need for cybersecurity</a> will save you from buying the wrong hardware early in your journey. If you're planning on running virtual machines (which you almost certainly will be), <a href="/blog/how-much-ram-do-i-need-for-cybersecurity" style="color: #06b6d4; text-decoration: underline;">how much RAM you have is especially critical</a>. Most beginners can start with 8GB and one lightweight Linux VM, but 16GB becomes the realistic floor once you start running two environments simultaneously.</p>
</div>
`;

combined = combined + bInject;

// Also add Editorial block at the top if missing
const pDate = new Date(a.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const uDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const editorial = `
<div class="editorial-attribution" style="font-size: 0.9em; color: #888; margin-bottom: 2rem; padding: 1rem; background: rgba(255,255,255,0.05); border-left: 3px solid #06b6d4; border-radius: 4px;">
  <p style="margin: 0 0 0.25rem 0"><strong>Written by:</strong> ${a.author}</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Edited by:</strong> Elijah Adeyeye, Founder, Elitech Hub</p>
  <p style="margin: 0 0 0.25rem 0"><strong>Originally published:</strong> ${pDate}</p>
  <p style="margin: 0"><strong>Last updated:</strong> ${uDate}</p>
</div>
`;

if (!combined.includes('editorial-attribution')) {
  combined = editorial + combined;
}

fs.writeFileSync('merged_content.html', combined);
console.log('Merged successfully');
