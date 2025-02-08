import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2>{"Home"}</h2>
      <button>
        <Link href="/auth">{"Sign In"}</Link>
      </button>
    </div>
  );
}
