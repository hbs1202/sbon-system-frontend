export interface OutingReason {
  Code: string;
  Name: string;
}

export interface StayReason {
  SysDtl_Cd: string;
  SysDtl_Name: string;
}

export interface Student {
  Student_ID: string;
  Student_Name: string;
  Grade: string;
  Pwd: string;
  phone: string;
  class: string;
  number: string;
}

export interface ServerStayRequest {
  Seq: number;
  SleepOut_Dt: string;
  Return_Date: string;
  SleepOut_Reason: string;
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
  status: string;
  actualReturnDate?: string;
  actualReturnTime?: string;
  note: string;
  seq: number;
}

export interface OutingRequest {
  id: string;
  studentId: string;
  date: string;
  time: string;
  returnTime: string;
  reason1: string;
  reason2: string;
  otherReason: string;
  reason1_Name: string;
  reason2_Name: string;
  status: string;
  seq: number;
  actualReturnTime?: string;
} 