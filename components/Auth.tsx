'use client';

import { useState } from "react";
import { supabase }from "../lib/supabase";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const signIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log("みたいよ", data)

        if (error) {
            setMessage(error.message);
        } else {
          setMessage("Signed in successfully!");  
        }
    };

    const signUp = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("signed up successfuly! Please check your email for confirmation.");
        // 登録成功後、ユーザー情報を`users`テーブルに挿入
            console.log("aaa", data)
            if (data?.user) {
                const { error: dbError } = await supabase.from("users").insert([
                    { id: data.user.id, email: data.user.email }
                ]);
                
                if (dbError) {
                    console.error("Error inserting user info database:", dbError,message);
                } else {
                    console.log("User inserted into database successfuly!");
                }
            }
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setMessage("Signed out successfully!");
    };
    return (
        <div>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            />
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            />
            <button onClick={signIn}>Sign In</button>
            <button onClick={signUp}>Sign Up</button> {/* 新規登録ボタンを追加 */}
            <button onClick={signOut}>Sign Out</button>
            <p>{message}</p>
            </div>
    );
}