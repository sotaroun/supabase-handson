'use client'

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Auth from "../../components/Auth";
import { Session } from "@supabase/supabase-js";
import { Post } from "../../types/supabaseTypes";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title,setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    // 現在のセッション情報を取得
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        fetchPosts(); // セッションが存在する場合に投稿データを取得
      }
    };

    getSession();

    // 認証の状態が変わった際にセッション情報を更新
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, sessionData) => {
        if (sessionData && sessionData) { // sessionDataがnullでないことを確認
          setSession(sessionData);
        fetchPosts(); //セッションが変わった場合も投稿データを取得
        } else {
          setSession(null); // sessionDataがnullの場合はセッションをリセット
        }
  });

    return () => {
      authListener?.subscription.unsubscribe();
    };
}, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*");
    setPosts(data || []);
  };

  const createPost = async () => {
    if (!session) return;
    await supabase.from("posts").insert([
      { title,content, user_id: session.user.id },
    ]);
    fetchPosts(); // 投稿を作成後、データを再取得
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
      <div>
        <h2>Your Posts</h2>
        {posts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>  
        ))}
      </div>
      <div>
        <h2>Create New Post</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          />
          <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          />
          <button onClick={createPost}>Create Post</button>
      </div>
    </div>
  );
}