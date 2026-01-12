-- 创建地形类型配置表
CREATE TABLE IF NOT EXISTS terrain_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    pace_factor TEXT NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_terrain_types_name ON terrain_types(name);
CREATE INDEX IF NOT EXISTS idx_terrain_types_is_active ON terrain_types(is_active);
CREATE INDEX IF NOT EXISTS idx_terrain_types_sort_order ON terrain_types(sort_order);

-- 插入默认地形类型数据
INSERT INTO terrain_types (name, pace_factor, color, icon, is_active, sort_order) VALUES
    ('沙地', '1.1', '#F59E0B', NULL, TRUE, 1),
    ('机耕道', '1.0', '#10B981', NULL, TRUE, 2),
    ('山路', '1.0', '#6366F1', NULL, TRUE, 3),
    ('石铺路', '1.0', '#8B5CF6', NULL, TRUE, 4),
    ('台阶', '1.0', '#EC4899', NULL, TRUE, 5)
ON CONFLICT (name) DO NOTHING;
