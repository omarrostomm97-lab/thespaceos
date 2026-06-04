import { useEffect } from "react";
import { useLocation } from "wouter";

export default function FinanceIndex() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/finance/expenses"); }, []);
  return null;
}
