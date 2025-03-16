const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Lấy danh sách người dùng (chỉ admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy thông tin một người dùng
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Nếu không phải admin và không phải chính user đó
        if (req.user.role !== 'admin' && user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền truy cập thông tin này' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    try {
        console.log('Update request body:', req.body);
        console.log('Update request file:', req.file);
        console.log('Update request headers:', req.headers);

        // Nếu không phải admin và không phải chính user đó
        if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật thông tin này' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Cập nhật thông tin cơ bản
        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;

        // Xử lý upload ảnh nếu có
        if (req.file) {
            console.log('Processing uploaded file:', req.file);
            const avatarUrl = `/uploads/${req.file.filename}`;
            
            // Xóa ảnh cũ nếu có và khác với ảnh mặc định
            if (user.avatar && !user.avatar.includes('default-avatar')) {
                const oldAvatarPath = path.join(__dirname, '../public', user.avatar);
                console.log('Checking old avatar path:', oldAvatarPath);
                
                if (fs.existsSync(oldAvatarPath)) {
                    console.log('Deleting old avatar file');
                    try {
                        fs.unlinkSync(oldAvatarPath);
                        console.log('Old avatar deleted successfully');
                    } catch (error) {
                        console.error('Error deleting old avatar:', error);
                    }
                } else {
                    console.log('Old avatar file not found');
                }
            }

            // Kiểm tra file đã được lưu thành công
            const newAvatarPath = path.join(__dirname, '../public', avatarUrl);
            if (fs.existsSync(newAvatarPath)) {
                console.log('New avatar file exists at:', newAvatarPath);
                user.avatar = avatarUrl;
                console.log('Updated avatar URL:', avatarUrl);
            } else {
                console.error('New avatar file was not saved properly');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Không thể lưu ảnh đại diện' 
                });
            }
        } else {
            console.log('No file uploaded');
        }

        console.log('Saving user with data:', {
            name: user.name,
            phone: user.phone,
            avatar: user.avatar
        });

        const updatedUser = await user.save();
        console.log('User saved successfully:', updatedUser);

        res.json({
            success: true,
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            role: updatedUser.role
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Xóa người dùng (chỉ admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép xóa tài khoản admin
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Không thể xóa tài khoản admin' });
        }

        await user.remove();
        res.json({ message: 'Người dùng đã được xóa' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Kiểm tra mật khẩu hiện tại
        const user = await User.findById(req.params.id).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Kiểm tra quyền truy cập
        if (req.user.role !== 'admin' && user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền thay đổi mật khẩu của người dùng khác'
            });
        }

        // Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Mật khẩu hiện tại không đúng' 
            });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.json({ 
            success: true,
            message: 'Đổi mật khẩu thành công' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}; 