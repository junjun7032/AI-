
import { AlgorithmCategory } from './types';

export const CATEGORIES: AlgorithmCategory[] = [
  '实际应用场景',
  '监督学习',
  '无监督学习',
  '强化学习',
  '神经网络',
  '深度学习',
  'Transformers'
];

export const SUGGESTED_ALGORITHMS: Record<AlgorithmCategory, string[]> = {
  '实际应用场景': [
    '电商推荐系统 (E-commerce RecSys)',
    '信用卡欺诈检测 (Fraud Detection)',
    '自动驾驶目标检测 (Autonomous Driving)',
    '智能客服问答系统 (RAG Chatbot)',
    '医疗影像诊断 (Medical Imaging)',
    '股市量化交易 (Algorithmic Trading)',
    '垃圾邮件过滤 (Spam Filtering)',
    '人脸识别门禁 (Face Recognition)'
  ],
  '监督学习': [
    '线性回归 (Linear Regression)',
    '逻辑回归 (Logistic Regression)',
    '决策树 (Decision Tree)',
    '支持向量机 (SVM)',
    '朴素贝叶斯 (Naive Bayes)',
    'K-近邻算法 (KNN)',
    '随机森林 (Random Forest)',
    '梯度提升树 (GBM)',
    'XGBoost',
    'LightGBM',
    'AdaBoost',
    '岭回归 (Ridge Regression)',
    'Lasso 回归',
    '弹性网络 (Elastic Net)'
  ],
  '无监督学习': [
    'K-均值聚类 (K-Means)',
    '主成分分析 (PCA)',
    '关联规则 (Apriori)',
    '层次聚类 (Hierarchical Clustering)',
    'DBSCAN 密度聚类',
    't-SNE 降维',
    '孤立森林 (Isolation Forest)',
    '高斯混合模型 (GMM)',
    '均值漂移 (Mean Shift)',
    '独立成分分析 (ICA)',
    '潜在狄利克雷分配 (LDA)'
  ],
  '强化学习': [
    'Q-Learning',
    'SARSA',
    '深度 Q 网络 (DQN)',
    '策略梯度 (Policy Gradient)',
    '近端策略优化 (PPO)',
    'Actor-Critic 算法',
    '蒙特卡洛树搜索 (MCTS)',
    'Deep Deterministic Policy Gradient (DDPG)'
  ],
  '神经网络': [
    '感知机 (Perceptron)',
    '多层感知机 (MLP)',
    '反向传播 (Backpropagation)',
    '随机梯度下降 (SGD)',
    '径向基函数网络 (RBFN)',
    '霍普菲尔德网络 (Hopfield Network)',
    '受限玻尔兹曼机 (RBM)',
    '自组织映射 (SOM)'
  ],
  '深度学习': [
    '卷积神经网络 (CNN)',
    '循环神经网络 (RNN)',
    '长短期记忆网络 (LSTM)',
    '门控循环单元 (GRU)',
    '生成对抗网络 (GAN)',
    '变分自编码器 (VAE)',
    '残差网络 (ResNet)',
    'YOLO (目标检测)',
    'U-Net (图像分割)',
    'MobileNet',
    'Capsule Networks (胶囊网络)'
  ],
  'Transformers': [
    'Transformer 架构',
    '自注意力机制 (Self-Attention)',
    'BERT',
    'GPT (Generative Pre-trained Transformer)',
    'Vision Transformer (ViT)',
    'T5',
    'RoBERTa',
    'XLNet',
    'ALBERT',
    'Swin Transformer',
    'Whisper (语音识别)',
    'CLIP (多模态)'
  ]
};
