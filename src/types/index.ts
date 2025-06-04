export interface Student {
  Student_ID: string;
  Student_Name: string;
  Grade: string;
  Pwd: string;
  phone: string;
  class: string;
  number: string;
}

export interface OutingRequest {
  id: string;
  studentId: string;
  date: string;
  time: string;
  returnTime: string;
  reason1: string;
  reason2: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  actualReturnTime: string | undefined;
  seq: number;
}

export interface StayRequest {
  id: string;
  studentId: string;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  reason: string;
  otherReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  actualReturnDate: string | undefined;
  actualReturnTime: string | undefined;
  note: string;
}

export const OUTING_REASONS = [
  '병원',
  '약국',
  '은행',
  '기타'
];

export const STAY_REASONS = [
  '가정방문',
  '병원',
  '약국',
  '은행',
  '기타'
]; 