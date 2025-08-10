# Git Commands

## Khởi tạo và cấu hình
```bash
git init
git remote add origin https://github.com/Ryan030904/WebsiteTinhCaloVaDinhDuong.git
```

## Thêm và commit code
```bash
git add .
git commit -m "Update: Thêm tính năng mới"
```

## Push code lên GitHub
```bash
# Lần đầu push (tạo nhánh main)
git branch -M main
git push -u origin main

# Các lần push sau
git push origin main
```

## Lưu ý
- Repository này sử dụng nhánh `main` (không phải `master`)
- Luôn commit với message mô tả rõ ràng
- Sử dụng `git add .` để thêm tất cả file thay đổi




