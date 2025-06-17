-- シフト管理テーブルの作成
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    shift_date DATE NOT NULL,
    time_slots TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, shift_date)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON shifts(user_id, shift_date);

-- サンプルデータの挿入
INSERT INTO shifts (user_id, shift_date, time_slots) VALUES
('user1', '2024-12-15', ARRAY['09:00-13:00', '14:00-18:00']),
('user1', '2024-12-16', ARRAY['10:00-14:00']),
('user1', '2024-12-20', ARRAY['13:00-17:00', '18:00-22:00'])
ON CONFLICT (user_id, shift_date) DO NOTHING;
