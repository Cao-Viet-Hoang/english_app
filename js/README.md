# JavaScript Modules Structure

Cấu trúc code đã được tổ chức lại để dễ bảo trì và mở rộng.

## 📁 Tổ chức Files

### `state.js`
- Quản lý trạng thái toàn cục của ứng dụng
- Các biến: currentScreen, currentTopic, currentFilter, currentTab
- Các hàm getter/setter để truy cập và cập nhật state

### `dataLoader.js`
- Load dữ liệu từ file `data.json`
- Quản lý: topicsData, vocabularyData, myWordsData
- Cung cấp API để truy xuất dữ liệu

### `navigation.js`
- Xử lý điều hướng giữa các màn hình
- Chuyển đổi bottom navigation
- Xử lý nút back

### `filters.js`
- Xử lý filter chips (All, Beginner, Intermediate, Advanced)
- Xử lý tabs trong My Words screen
- Tìm kiếm từ vựng

### `topics.js`
- Render danh sách topics
- Xử lý click vào topic card
- Mở màn hình word list cho topic

### `wordCards.js`
- Render word cards
- Xử lý các tương tác trên word card:
  - Audio buttons (US/UK)
  - Reveal/hide Vietnamese meaning
  - Expand để xem chi tiết

### `audio.js`
- Phát âm từ vựng bằng Web Speech API
- Hỗ trợ cả US và UK pronunciation

### `wordDetail.js`
- Hiển thị bottom sheet chi tiết từ vựng
- Generate HTML cho các sections:
  - Word type & forms
  - Meanings
  - Examples
  - Common mistakes
  - Synonyms
  - Collocations
- Xử lý các tương tác trong detail view

### `myWords.js`
- Render "My Words" screen
- Filter theo category (All, Work, IELTS, Custom)

### `modal.js`
- Xử lý modal "Add New Word"
- Form validation và submission
- Thêm từ mới vào myWordsData

### `utils.js`
- Notification system
- Utility button listeners (Review, Settings, Filter)
- Các helper functions chung

### `app.js`
- File khởi tạo chính
- Kết nối tất cả modules
- Initialize app khi DOM ready

## 🔄 Thứ tự Load Files (trong index.html)

```html
<script src="js/state.js"></script>          <!-- 1. State management trước -->
<script src="js/dataLoader.js"></script>     <!-- 2. Data loading -->
<script src="js/audio.js"></script>          <!-- 3. Audio utilities -->
<script src="js/navigation.js"></script>     <!-- 4. Navigation -->
<script src="js/filters.js"></script>        <!-- 5. Filters & search -->
<script src="js/topics.js"></script>         <!-- 6. Topics rendering -->
<script src="js/wordCards.js"></script>      <!-- 7. Word cards -->
<script src="js/wordDetail.js"></script>     <!-- 8. Word details -->
<script src="js/myWords.js"></script>        <!-- 9. My Words -->
<script src="js/modal.js"></script>          <!-- 10. Add word modal -->
<script src="js/utils.js"></script>          <!-- 11. Utilities -->
<script src="js/app.js"></script>            <!-- 12. Main initialization -->
```

## 🎯 Lợi ích

✅ **Dễ bảo trì**: Mỗi file chỉ chứa 1 nhóm tính năng liên quan
✅ **Dễ debug**: Biết chính xác file nào chứa logic cần sửa
✅ **Dễ mở rộng**: Thêm tính năng mới chỉ cần tạo file mới
✅ **Code rõ ràng**: Mỗi file có mục đích cụ thể
✅ **Team work**: Nhiều người có thể làm việc song song trên các file khác nhau

## 📝 Quy tắc khi thêm code mới

1. **Tính năng mới** → Tạo file mới trong folder `js/`
2. **Sửa tính năng có sẵn** → Tìm file tương ứng và sửa
3. **State mới** → Thêm vào `state.js`
4. **Utility function** → Thêm vào `utils.js`
5. **Nhớ import** file mới vào `index.html` theo đúng thứ tự dependencies
