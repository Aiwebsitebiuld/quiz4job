import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী | Quiz4Job" },
      { name: "description", content: "Quiz4Job ব্যবহারের শর্তাবলী এবং নিয়মাবলী।" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-lg">
      <h1>শর্তাবলী</h1>
      <p>Quiz4Job ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন।</p>
      <h2>১. অ্যাকাউন্ট</h2>
      <p>সঠিক তথ্য দিয়ে নিবন্ধন করতে হবে। একাধিক অ্যাকাউন্ট তৈরি নিষিদ্ধ।</p>
      <h2>২. কুইজ ও পুরস্কার</h2>
      <p>কুইজে অসদুপায় অবলম্বন করলে অ্যাকাউন্ট স্থগিত হবে এবং পুরস্কার বাতিল হবে।</p>
      <h2>৩. পেমেন্ট</h2>
      <p>প্রিমিয়াম সদস্যতার ফি ৳১০/মাস, অফেরতযোগ্য।</p>
      <h2>৪. দায়িত্ব</h2>
      <p>আমরা সঠিক তথ্য সরবরাহের চেষ্টা করি, তবে কোনো ত্রুটির জন্য Quiz4Job সরাসরি দায়ী নয়।</p>
      <h2>৫. পরিবর্তন</h2>
      <p>আমরা যেকোনো সময় শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করি।</p>
    </div>
  ),
});