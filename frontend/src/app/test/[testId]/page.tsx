import TestClient from "./TestClient";

export function generateStaticParams() {
  return [
    { testId: "daily-morning" },
    { testId: "daily-evening" },
    { testId: "grand-mock" },
    { testId: "1" },
    { testId: "2" },
    { testId: "3" },
    { testId: "4" },
    { testId: "5" },
  ];
}

export default function TestPage() {
  return <TestClient />;
}
