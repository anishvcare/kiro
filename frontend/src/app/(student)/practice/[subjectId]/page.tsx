import SubjectClient from "./SubjectClient";

export function generateStaticParams() {
  return Array.from({ length: 19 }, (_, i) => ({
    subjectId: String(i + 1),
  }));
}

export default function SubjectPracticePage() {
  return <SubjectClient />;
}
