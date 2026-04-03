import avaneesh from '../assets/team/avaneesh_yajurvedi.jpg'
import durgesh from '../assets/team/Durgesh_President.jpg'
import atharv from '../assets/team/atharv_madan_barge.jpg'
import yashika from '../assets/team/yashika_dhumal.jpg'
import khushi from '../assets/team/khushi_gupta.jpg'
import sanskar from '../assets/team/sanskar_yuvraj_virat.jpg'
import samruddhi from '../assets/team/samruddhi_bhosale.png'
import shrutika from '../assets/team/shrutika_bhand.jpg'
import arya from '../assets/team/arya_jain.jpeg'
import anuj from '../assets/team/anuj_deore.png'

export interface TeamMember {
  name: string
  role: string
  image?: string   // imported image module — leave undefined to show generated avatar
  github?: string
  linkedin?: string
  instagram?: string
}

export interface TeamData {
  leadership: TeamMember[]
  technical: TeamMember[]
  events: TeamMember[]
  outreach: TeamMember[]
  contentPR: TeamMember[]
  documentation: TeamMember[]
}

const teamData: TeamData = {

  leadership: [
    {
      name: 'Durgesh',
      role: 'President',
      image: durgesh,
      github: 'https://github.com/Drugexsh',
      linkedin: 'https://www.linkedin.com/in/durgeshfore/',
    },
    {
      name: 'Avaneesh Yajurvedi',
      role: 'Vice President',
      image: avaneesh,
      github: 'https://github.com/AvaneeshYajurvedi',
      linkedin: 'http://www.linkedin.com/in/avaneesh-yajurvedi-99bb77377',
    },
  ],

  technical: [
    { name: '', role: 'Tech Lead' },
    { name: '', role: 'Technical Member' },
    { name: '', role: 'Technical Member' },
    { name: '', role: 'Technical Member' },
    { name: '', role: 'Tech Lead' },
    { name: '', role: 'Technical Member' },
    { name: '', role: 'Technical Member' },
    { name: '', role: 'Technical Member' },
  ],

  events: [
    { name: '', role: 'Team Head' },
    { name: '', role: 'Team Member' },
    { name: '', role: 'Team Member' },
    { name: '', role: 'Team Member' },
  ],

  outreach: [
    { name: '', role: 'Team Head' },
    { name: '', role: 'Team Member' },
    { name: '', role: 'Team Member' },
    { name: '', role: 'Team Member' },
  ],

    contentPR: [
    { name: 'Atharv Madan Barge', 
      role: 'Team Head' , 
      image: atharv,
      github: 'https://github.com/atharvbarge-bytes',
      linkedin: 'https://www.linkedin.com/in/atharv-barge-b32a44362/',
    },
    { name: 'Yashika A. Dhumal', 
      role: 'Team Member', 
      image : yashika
    },
    { name: 'Khushi Rajesh Gupta ', 
      role: 'Team Member', 
      image: khushi,
      linkedin: 'https://www.linkedin.com/in/atharv-barge-b32a44362/',
    },
    { name: '', role: 'Team Member' },
  ],

  documentation: [
    { name: 'Sanskar Yuvraj Virat', 
      role: 'Team Head', 
      image: sanskar,
      github: 'https://github.com/sanskar-sol',
      linkedin: 'https://www.linkedin.com/in/sanskar-virat-95b533390/'
    },
    { name: 'Samruddhi Bhosale', 
      role: 'Team Head', 
      image: samruddhi,
      github: 'https://github.com/samruddhibhosale17',
      linkedin: 'https://www.linkedin.com/in/samruddhi-bhosale-4863ab377/'
    },
    { name: 'Shrutika Bhand', 
      role: 'Team Member',
      image: shrutika,
      github: 'https://github.com/shrutikabhand',
      linkedin: 'https://www.linkedin.com/in/shrutika-bhand-139267370/'
    },
    { name: 'Aarya Jain ', 
      role: 'Team Member', 
      image: arya,
      github: 'https://github.com/aaryaa-jain',
      linkedin: 'https://www.linkedin.com/in/aarya-jain-60ba753a5/'
    },
    { name: 'Anuj Deore', 
      role: 'Team Member',
      image: anuj,
      linkedin: 'https://www.linkedin.com/in/anuj-deore-70b3003a1'
    },
  ],
}

export default teamData
