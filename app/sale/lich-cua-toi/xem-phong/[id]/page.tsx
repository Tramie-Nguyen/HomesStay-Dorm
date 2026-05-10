"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "../../../components/common/datepicker";
import TimePicker from "../../../components/common/timepicker";
import CustomerCard from "@/components/customer/CustomerCard";
import RoomCard from "@/components/room/roomCard";

export default function RentalDetail() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    
}
