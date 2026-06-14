import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তা নীতি | Quiz4Job" },
      { name: "description", content: "Quiz4Job-এর গোপনীয়তা নীতি — আমরা আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ ও ব্যবহার করি।" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-lg">
      <h1>গোপনীয়তা নীতি</h1>
      <p>আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ।</p>
      <h2>তথ্য সংগ্রহ</h2>
      <p>আমরা নাম, ইমেইল, ফোন নম্বর এবং কুইজ পারফরম্যান্স ডেটা সংগ্রহ করি।</p>
      <h2>ব্যবহার</h2>
      <p>সংগৃহীত তথ্য শুধুমাত্র সেবা উন্নয়ন, পুরস্কার বিতরণ ও যোগাযোগের জন্য ব্যবহৃত হয়।</p>
      <h2>শেয়ারিং</h2>
      <p>আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে শেয়ার করি না।</p>
      <h2>নিরাপত্তা</h2>
      <p>আপনার ডেটা এনক্রিপশন ও নিরাপদ সার্ভারে সংরক্ষিত থাকে।</p>
      <h2>যোগাযোগ</h2>
      <p>প্রশ্ন থাকলে support@quiz4job.com-এ যোগাযোগ করুন।</p>
    </div>
  ),
});