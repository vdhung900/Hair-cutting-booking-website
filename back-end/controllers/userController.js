const User = require('../models/User');

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
        const { name, email, phone, address } = req.body;

        // Nếu không phải admin và không phải chính user đó
        if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền cập nhật thông tin này' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra email đã tồn tại chưa (nếu thay đổi email)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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