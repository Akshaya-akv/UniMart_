export type ListingType = 'sell' | 'lend' | 'free';

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: ListingType;
  category_id: string;
  price: number;
  condition: string;
  department: string;
  semester: string;
  course_code?: string;
  image_url: string;
  status: string;
  return_date?: string;
  created_at: string;
  
  // Joined fields from profiles
  profiles?: {
    name: string;
    college_verified: boolean;
  };
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  department: string;
  semester: string;
  college_verified: boolean;
  role: string;
  points: number;
  sustainability_score: number;
  trust_score: number;
}
