
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AlgorithmExplanation, VisualType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const visualizationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: [VisualType.FLOW, VisualType.CHART, VisualType.MATRIX] },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['input', 'process', 'output', 'operation'] },
          x: { type: Type.NUMBER, description: "Relative X position 0-100" },
          y: { type: Type.NUMBER, description: "Relative Y position 0-100" },
          highlight: { type: Type.BOOLEAN }
        },
        required: ['id', 'label']
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          label: { type: Type.STRING },
          active: { type: Type.BOOLEAN }
        }
      }
    },
    matrix: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.NUMBER },
            label: { type: Type.STRING },
            highlight: { type: Type.BOOLEAN }
          },
          required: ['value']
        }
      }
    },
    chartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          group: { type: Type.STRING },
          highlight: { type: Type.BOOLEAN }
        },
        required: ['x', 'y']
      }
    },
    chartConfig: {
        type: Type.OBJECT,
        properties: {
            xAxisLabel: { type: Type.STRING },
            yAxisLabel: { type: Type.STRING },
            showLine: { type: Type.BOOLEAN },
            xDomain: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[min, max] fixed range" },
            yDomain: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[min, max] fixed range" }
        }
    }
  },
  required: ['type']
};

const stepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stepNumber: { type: Type.INTEGER },
    title: { type: Type.STRING },
    description: { type: Type.STRING, description: "Detailed explanation in Markdown format. For scenarios, explain the solution architecture." },
    keyTerms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 key technical terms or business concepts relevant to this step." },
    visualData: visualizationSchema
  },
  required: ['stepNumber', 'title', 'description', 'visualData']
};

const explanationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    category: { type: Type.STRING },
    summary: { type: Type.STRING },
    datasetInfo: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Name of the example dataset or business data log" },
            description: { type: Type.STRING, description: "Brief description of the data context." },
            fields: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "List of feature names (e.g. ['用户ID', '点击历史', '停留时间'])" 
            },
            sampleCount: { type: Type.STRING, description: "Size of dataset (e.g. '1000条用户日志')" },
            distribution: { type: Type.STRING, description: "Description of data characteristics" }
        },
        required: ['name', 'description', 'fields', 'sampleCount', 'distribution']
    },
    useCases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 common real-world usage scenarios"
    },
    steps: {
      type: Type.ARRAY,
      items: stepSchema
    }
  },
  required: ['name', 'category', 'summary', 'datasetInfo', 'useCases', 'steps']
};

export const generateAlgorithmExplanation = async (algorithmName: string): Promise<AlgorithmExplanation> => {
  try {
    const prompt = `
      创建一个关于 "${algorithmName}" 的专家级交互式可视化解释。
      
      请用简体中文 (Simplified Chinese) 回答。
      
      **核心逻辑判定**：
      如果是**算法名称**（如 "Transformer", "SVM"）：侧重于数学原理和内部机制。
      如果是**实际应用场景**（如 "电商推荐系统", "欺诈检测", "自动驾驶"）：侧重于**解决方案分析 (Solution Analysis)**。
      
      对于【实际应用场景】的特殊要求：
      1. **结构**：
         - 步骤1：**场景与痛点分析** (Visual: 概览图或数据分布)。
         - 步骤2：**数据准备与特征工程** (Visual: 原始数据矩阵或特征相关性图)。
         - 步骤3：**核心算法实现** (Visual: 算法流程图，如双塔模型结构)。
         - 步骤4：**模型训练与优化** (Visual: 损失函数下降或权重更新)。
         - 步骤5：**结果与业务价值总结** (Visual: 预测结果对比或效果提升图)。
      2. **可视化建议**：
         - **推荐系统**：使用 MATRIX 展示 用户-物品 评分矩阵，或 FLOW 展示 召回->排序 漏斗。
         - **欺诈检测**：使用 CHART (Scatter) 展示正常交易与异常交易的聚类分布。
         - **RAG/问答**：使用 FLOW 展示 检索 -> 增强 -> 生成 的链路。
      
      通用要求：
      1. **深度内容**：使用 Markdown 格式，加粗关键点，列表清晰。
      2. **微型数据集**：必须构造一个具体的、简化的数据集上下文 (例如：5个用户对5个商品的评分矩阵)。
      3. **关键概念 (Key Terms)**：提取业务术语（如 'CTR预估', '协同过滤'）或技术术语供用户点击提问。
      4. **数据驱动动画**：确保步骤间的 visualData 连贯变化。
      
      请确保解释既有技术深度，又贴合实际业务落地场景。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: explanationSchema,
        temperature: 0.4
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AlgorithmExplanation;

  } catch (error) {
    console.error("GenAI Error:", error);
    throw error;
  }
};

export const chatWithAI = async (currentContext: string, userQuery: string, history: {role: string, parts: {text: string}[]}[] = []) => {
    try {
        const systemInstruction = `
        你是一位专业的人工智能架构师和导师。
        用户当前正在查看以下内容的解释：${currentContext}。
        
        回答要求：
        1. **角色切换**：如果当前是"实际应用场景"，请以**解决方案架构师**的角度回答，关注业务落地、系统设计和工程挑战。如果是"算法原理"，请以**数学/算法科学家**的角度回答。
        2. **Markdown 格式**：使用代码块、粗体、列表，甚至表格。
        3. **关联上下文**：引用当前演示的数据集（例如："就像我们刚刚在矩阵中看到的 User A 对 Item B 的评分..."）。
        4. **通俗易懂**：用类比解释复杂概念（例如：将"Embedding"解释为"在地图上给单词找坐标"）。
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: history
        });

        const result = await chat.sendMessage({ message: userQuery });
        return result.text;
    } catch (error) {
        console.error("Chat Error", error);
        throw error;
    }
};
