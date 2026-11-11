/**
 * Elitech Hub advisors. The site previously read these from an `advisors`
 * database table that was never created, so /advisors showed an error and
 * no advisor was visible to search engines. Edit this list to add or update
 * advisors; /advisors, /advisors/[slug], the About page cards, the sitemap
 * and the Person schema are all built from it.
 */
export type Advisor = {
  slug: string;
  name: string;
  /** Name without honorifics or post-nominals, for schema.org `name`. */
  plainName: string;
  credential: string;
  jobTitle: string;
  organization: string;
  /** One sentence, used on cards and in meta descriptions. */
  summary: string;
  /** Full biography, one string per paragraph. */
  bio: string[];
  image: string;
  linkedin?: string;
  website?: string;
  alumniOf: string[];
  knowsAbout: string[];
};

export const ADVISORS: Advisor[] = [
  {
    slug: 'olasunkanmi-kehinde',
    name: 'Dr. Olasunkanmi J. Kehinde',
    plainName: 'Olasunkanmi James Kehinde',
    credential: 'Ph.D., Educational Psychology',
    jobTitle: 'Assistant Professor of Psychology',
    organization: 'Norfolk State University',
    summary:
      'Psychometrician and Assistant Professor of Psychology at Norfolk State University, using AI and data science to improve how learning is measured.',
    bio: [
      'Dr. Olasunkanmi James Kehinde is an Assistant Professor in the Department of Psychology at Norfolk State University. He is a quantitative psychologist and psychometrician, and his work uses data science, artificial intelligence and careful measurement to help institutions understand how students learn and make better decisions.',
      'He completed his Ph.D. in Educational Psychology at Washington State University in 2024. For five years during his doctorate he worked as a Research Assistant at the university’s Learning and Performance Research Center, where he built his experience in large-scale assessment. Before moving to Norfolk State, he was Assistant Professor of Quantitative Psychology and Psychometrics at Elizabeth City State University. In 2025 the Rutgers Center for Minority Serving Institutions selected him as an ELEVATE Fellow.',
      'His research draws on methods such as item response theory, structural equation modeling and multidimensional graded response models. A growing part of his work looks at how large language models can support psychometrics. His recent studies show that AI can predict how difficult test items will be in large-scale assessments, and can pick out motivation-related themes in students’ written answers. That saves many hours of coding responses by hand without lowering measurement standards.',
      'He also applies these methods to health and medical questions. His peer-reviewed work has appeared in journals including Frontiers in Education and the Journal of Technology in Behavioral Science. It covers day-to-day changes in thinking and memory, children’s health behaviours, what conversations about mental health can reveal, and the social factors linked to ADHD in adults.',
    ],
    image: '/assets/images/olasunkanmi-kehinde.png',
    linkedin: 'https://www.linkedin.com/in/olasunkanmi-kehinde',
    alumniOf: ['Washington State University'],
    knowsAbout: ['Psychometrics', 'Item Response Theory', 'Structural Equation Modeling', 'Large Language Models in Assessment', 'Educational Psychology'],
  },
  {
    slug: 'ayodele-alonge',
    name: 'Dr. Ayodele John Alonge',
    plainName: 'Ayodele John Alonge',
    credential: 'Ph.D., Communication and Information Studies',
    jobTitle: 'Lecturer, Library, Archival and Information Studies',
    organization: 'University of Ibadan',
    summary:
      'Lecturer at the University of Ibadan whose research covers digital libraries, publishing and health communication online.',
    bio: [
      'Dr. Ayodele John Alonge is a Lecturer in the Department of Library, Archival and Information Studies at the University of Ibadan. He teaches and researches in library science, communication and information science, and publishing, with a particular interest in how digital tools change the way people find and share information.',
      'He holds a Ph.D. in Communication and Information Studies from the School of Journalism and Mass Communication at the University of Nairobi, Kenya. He also earned a Master of Publishing and Copyright Studies and a Bachelor of Library and Information Studies from the University of Ibadan.',
      'His work has also taken him abroad. He has been a Digital Transformation Researcher at the Amsterdam University of Applied Sciences in the Netherlands, a Visiting Scholar at the University of Groningen, where he managed special collections, and a Visiting Scholar at Karatina University in Kenya.',
      'Much of his research looks at health communication online, especially how social media can support HIV/AIDS awareness and reduce risky behaviour among young people in Africa. He also writes on digital libraries, e-publishing, records management and green libraries. In 2025 he co-edited a book of reflections on Nigeria’s EndSARS movement.',
      'As Project Director and Consultant Librarian for the Afrelib Trust, he leads the Green Library Project, which brings sustainable practices into libraries, and introduces e-learning on mobile devices in Nigerian schools. In his own teaching he uses technology to make learning more active and collaborative.',
      'He is a Certified Librarian in Nigeria and a Fellow of the Consortium for Advanced Research Training in Africa (CARTA). He is a member of the Nigerian Library Association, the American Library Association and the African Library and Information Associations and Institutions (AfLIA).',
    ],
    image: '/assets/images/ayodele-alonge.png',
    linkedin: 'https://www.linkedin.com/in/ayodele-john-alonge',
    website: 'https://optimisticscholar.com',
    alumniOf: ['University of Nairobi', 'University of Ibadan'],
    knowsAbout: ['Library and Information Science', 'Digital Libraries', 'Publishing', 'Health Communication', 'Digital Transformation'],
  },
  {
    slug: 'yemi-adeyeye',
    name: 'Yemi Adeyeye, Ph.D.',
    plainName: 'Yemi Adeyeye',
    credential: 'Ph.D., Forestry',
    jobTitle: 'City Forester and Manager of Forestry and Natural Areas',
    organization: 'City of Windsor',
    summary:
      'City Forester for Windsor, Ontario, and former Global Director of YPARD, working on environmental governance and urban forestry.',
    bio: [
      'Dr. Yemi Adeyeye is the City Forester and Manager of Forestry and Natural Areas for the City of Windsor, Ontario, Canada. He looks after natural assets valued at $400 million, and he led the development of Windsor’s first 20-year Urban Forest Management Strategy, which combines long-term planning, the value that trees and green spaces bring, and input from residents.',
      'He earned his Ph.D. in Forestry at the University of British Columbia. His doctoral research examined power, Indigenous participation and whose knowledge counts in resource governance, with case studies from Bolivia and from global environmental forums. He also holds master’s degrees from Bangor University in Wales and the University of Copenhagen in Denmark.',
      'Before taking on city leadership in Canada, he spent years working on forestry policy and youth engagement across five continents. He was Global Coordinator for GLFx at the Global Landscapes Forum, managing community-based landscape projects funded by several donors. Before that he was Global Director of Young Professionals for Agricultural Development (YPARD), hosted by the Food and Agriculture Organization of the United Nations, where he led a network of young professionals in more than 100 countries and raised significant international funding. He also wrote the first youth and volunteer engagement strategy for the FAO’s XIV World Forestry Congress.',
      'His research and policy work focuses on environmental governance, urban forestry and fairness in how decisions are made. He argues for wider inclusion in environmental science, including Black professionals and Indigenous knowledge.',
    ],
    image: '/assets/images/yemi-adeyeye.jpg',
    linkedin: 'https://www.linkedin.com/in/yemi-adeyeye',
    website: 'https://yemiadeyeye.com/',
    alumniOf: ['University of British Columbia', 'Bangor University', 'University of Copenhagen'],
    knowsAbout: ['Urban Forestry', 'Environmental Governance', 'Natural Resource Management', 'Youth Engagement', 'Indigenous Knowledge'],
  },
];

export function getAdvisor(slug: string): Advisor | undefined {
  return ADVISORS.find((a) => a.slug === slug);
}
