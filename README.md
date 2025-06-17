# Shif-Post

**月次シフト提出Webアプリケーション**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yoshi0827101328-9306s-projects/v0-shift-calendar-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/v43Ocy1p2PF)

## 📝 概要

**アルバイト・スタッフ向けの勤務希望シフト提出Webアプリケーション**です。  
カレンダー形式のUIを通じて簡単に勤務可能日・時間帯を登録・編集でき、PDFやiCal形式でのエクスポートも可能です。

---

## 🧠 設計・開発のポイント

- **ユーザー中心のワークフロー設計**  
  「カレンダーで日付を選択 → 勤務可能な時間帯を選択 → データベースに登録」という、迷わず操作できるUIを設計。

- **時間帯と曜日の一括登録**に対応  
  同じ曜日の複数日に同じ勤務時間をまとめて入力でき、効率的なシフト登録が可能です。

- **多様なエクスポート形式**  
  提出済みのシフトをPDFまたはiCal形式で出力することで、紙・デジタルどちらでも管理がしやすくなっています。

---

## ✅ 主な機能

### 🗓️ シフト登録・管理機能

- カレンダーUIで希望日・時間帯を視覚的に選択
- 選択した勤務時間はデータベースに即時保存
- 既存のシフトを**編集・削除**可能
- 同じ曜日を指定して**一括登録**できる機能も搭載

### 💰 時給・月収の自動計算

- 各勤務に時給を設定可能
- 登録済みのシフトに基づき、合計労働時間と月収見込みを自動計算

---

## 📤 エクスポート機能

### 📅 iCal形式出力（.ics）

- Googleカレンダー、Outlook、TimeTreeなどのカレンダーアプリに取り込み可能
- 各勤務を予定として自動生成

### 📄 PDF出力

- 印刷に適したレイアウトで勤務表を出力
- PDFファイルとしてダウンロード・メール送信が可能

---

## 🚀 デプロイ情報

本アプリは以下で公開・ホスティングされています：

**[https://vercel.com/yoshi0827101328-9306s-projects/v0-shift-calendar-app](https://vercel.com/yoshi0827101328-9306s-projects/v0-shift-calendar-app)**
