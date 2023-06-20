const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'shhhhh');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};


exports.module = { verifyToken }