const dreamCompanySchema = require("../models/dreamComanySchema");
const companySchema = require("../models/companySchema");
const rolesSchema = require("../models/rolesSchema");
const roadMapSchema = require("../models/roadMapSchema");
const dreamRoadMapSchema = require("../models/dreamRoadMapSchema");
const testSchema = require("../models/dreamRoleTestSchema");
const Together = require("together-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parse } = require("dotenv");
const dreamRoleSchema = require("../models/dreamRoleSchema");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY);
const genAI2 = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY_2);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model2 = genAI2.getGenerativeModel({ model: "gemini-1.5-flash" });

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// function parseJson(content) {
//   const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
//   const match = content.match(jsonRegex);

//   if (!match) {
//     console.warn("No JSON block found in the content.");
//     return null;
//   }

//   const jsonString = match[1].trim();

//   try {
//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error("Failed to parse JSON:", error);
//     return null;
//   }
// }

// const generateSkillRoadmap = async (role) => {
//   const prompt = `

// "Generate a comprehensive, industry-standard skill roadmap for a professional \"${role}\", structured from beginner to expert level. The response must be a pure JSON object, adhering to the following strict requirements:

// 1. Skill Separation: List exactly 8 distinct, globally recognized skills essential for the role. Do not merge disparate skills (e.g., \"HTML\" and \"CSS\" must be separate). Sub-skills are only grouped if they constitute a recognized industry standard (e.g., \"React\" within a broader \"Frontend Frameworks\" skill).

// 2. Topics Per Skill: Each skill must contain 8-10 highly relevant, job-critical topics. These topics must be meticulously ordered, progressing logically from foundational concepts to advanced, expert-level knowledge.

// 3. Topic Structure: Every topic must be an object with three keys:
//     - \"topicName\": A concise, standard, and widely used title (e.g., \"Flexbox Layout\", not \"Advanced Flexbox Layout Techniques Explained\").
//     - \"description\": A brief 1-2 line summary, focusing on the practical application or core understanding of the topic.
//     - \"completed\": false (default boolean value, always).
//     - \"score\": null (default null value, always).

// 4. Content Rules:
//     - Prioritize topics that are most crucial for a professional \"{{role}}\}\" in the current job market, emphasizing practical utility and real-world applicability.
//     - For 'Testing & Debugging', include only the most essential and commonly used tools (e.g., Jest, React Testing Library, browser DevTools); avoid overly specific or niche tools.
//     - Ensure absolute uniqueness of topics; if a concept is covered under one skill (e.g., \"Asynchronous JS\" under JavaScript), it must not reappear under another (e.g., 'APIs').
//     - Focus on core competencies and established technologies; refrain from including experimental or rapidly changing technologies unless they are clearly becoming industry standards.

// Output Format:
// The entire response must be a pure JSON object, without any additional text, markdown formatting (other than for the JSON itself), comments, or apologies.

// Example JSON Structure (for internal reference, actual content varies based on {{role}}):
// {
//   \"{{role}}\": [
//     {
//       \"skill\": \"HTML\",
//       \"topics\": [
//         {
//           \"topicName\": \"Semantic HTML\",
//           \"description\": \"Using HTML5 tags for meaningful structure.\",
//           \"completed\": false,
//           \"score\": null
//         },
//         // ... more topics
//       ]
//     },
//     {
//       \"skill\": \"CSS\",
//       \"topics\": [
//         {
//           \"topicName\": \"Flexbox\",
//           \"description\": \"Creating one-dimensional layouts.\",
//           \"completed\": false,
//           \"score\": null
//         },
//         // ... more topics
//       ]
//     }
//     // ... more skills
//   ]
// }"
//       `;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const analysisText = response.text();

//     const jsonRoleObject = parseJson(analysisText);
//     return jsonRoleObject;
//   } catch (error) {
//     console.error("Error generating skill roadmap:", error);
//     throw new Error(`Failed to generate roadmap for role: ${role}`);
//   }
// };

// const generateCompanyDetails = async (company) => {
//   const prompt = `You are a professional data researcher specializing in company information for career platforms. Your task is to create a comprehensive, accurate JSON object for "${company}" with this exact structure:

// {
//   "name": "Full official company name",
//   "logo": "Working, high-resolution logo URL (must be publicly accessible)",
//   "overview": "Professional 60-80 word summary covering founding year, founders, headquarters, core business, key innovations, career culture, global presence, and job seeker appeal",
//   "topRoles": ["5 most common roles (prioritize technical roles like SDE, Network Engineer, Cloud Architect, Cybersecurity Analyst, Product Manager)"],
//   "locations": ["At most 5 major office locations worldwide with '(HQ)' marking headquarters"]
// }

// CRITICAL REQUIREMENTS:
// 1. The 'logo' field MUST be dynamically generated using the format https://logo.clearbit.com/{domain}, where {domain} is the primary domain. Ensure this URL is functional and points to a high-resolution logo.
// 2. Validate all other information (overview, topRoles, locations) through at least 3 reliable sources.
// 3. Prioritize career-relevant details for job seekers.
// 4. Maintain a professional yet motivational tone.
// 5. Return ONLY valid JSON with no additional text or explanations.

// QUALITY STANDARDS:
// - The 'logo' URL must be a direct image link (PNG/JPG) generated from the Clearbit API format.
// - The 'overview' must include all specified elements.
// - 'locations' must be specific office cities, not regions.

// RETURN ONLY THE JSON OBJECT. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.`;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const analysisText = response.text();
//     const jsonRoleObject = parseJson(analysisText);
//     return jsonRoleObject;
//   } catch (error) {
//     console.error("Error generating skill roadmap:", error);
//     throw new Error(`Failed to generate roadmap for role: ${role}`);
//   }
// };

// const addDreamRole = async (req, res) => {
//   try {
//     const { userId, company, role } = req.body;

//     if (!userId || !company || !role) {
//       return res.status(400).json({
//         message:
//           "Missing required fields: userId, company, and role are required",
//       });
//     }

//     const dreamCompany = company.trim().toUpperCase();
//     const dreamRole = role.trim().toUpperCase();

//     const existingRole = await rolesSchema.findOne({ name: dreamRole });

//     if (existingRole) {
//       try {
//         const parsedData = JSON.parse(existingRole.data);
//         return res.status(200).json(parsedData);
//       } catch (parseError) {
//         console.error("Error parsing existing role data:", parseError);
//       }
//     }

//     const companyDetails = await generateCompanyDetails(dreamCompany);
//     const skillRoadmap = await generateSkillRoadmap(dreamRole);

//     const newcompany = new companiesSchema({
//       name: dreamCompany,
//       data: JSON.stringify(companyDetails),
//     });

//     await newcompany.save();

//     const saveCompanyDetails = new dreamCompanySchema(companyDetails);
//     await saveCompanyDetails.save();

//     const newRole = new rolesSchema({
//       name: dreamRole,
//       data: JSON.stringify(skillRoadmap),
//     });

//     await newRole.save();

//     const saveDreamRole = new dreamRoleSchema({
//       userId: userId,
//       dreamRole: dreamRole,
//       skills: skillRoadmap,
//     });
//     await saveDreamRole.save();
//     return res
//       .status(201)
//       .json({ company: companyDetails, role: skillRoadmap });
//   } catch (error) {
//     console.error("Error in addDreamRole:", error);
//     return res.status(500).json({
//       message: "Internal server error while processing dream role",
//       error: error.message,
//     });
//   }
// };

const parseJson = (content) => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = content.match(jsonRegex);

  if (!match) {
    console.warn("No JSON block found in the content.");
    return null;
  }

  const jsonString = match[1].trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};

const generateSkillRoadmap = async (role) => {
  const prompt = `
Generate a comprehensive, industry-standard skill roadmap for a professional "${role}", structured from beginner to expert level. The response must be a pure JSON object, adhering to the following strict requirements:

1. Skill Separation: List exactly 8 distinct, globally recognized skills essential for the role. Do not merge disparate skills (e.g., "HTML" and "CSS" must be separate). Sub-skills are only grouped if they constitute a recognized industry standard (e.g., "React" within a broader "Frontend Frameworks" skill).

2. Topics Per Skill: Each skill must contain 8-10 highly relevant, job-critical topics. These topics must be meticulously ordered, progressing logically from foundational concepts to advanced, expert-level knowledge.

3. Topic Structure: Every topic must be an object with three keys:
    - "topicName": A concise, standard, and widely used title (e.g., "Flexbox Layout", not "Advanced Flexbox Layout Techniques Explained").
    - "description": A brief 1-2 line summary, focusing on the practical application or core understanding of the topic.
    - "completed": false (default boolean value, always).
    - "score": null (default null value, always).

4. Content Rules:
    - Prioritize topics that are most crucial for a professional "${role}" in the current job market, emphasizing practical utility and real-world applicability.
    - For 'Testing & Debugging', include only the most essential and commonly used tools (e.g., Jest, React Testing Library, browser DevTools); avoid overly specific or niche tools.
    - Ensure absolute uniqueness of topics; if a concept is covered under one skill (e.g., "Asynchronous JS" under JavaScript), it must not reappear under another (e.g., 'APIs').
    - Focus on core competencies and established technologies; refrain from including experimental or rapidly changing technologies unless they are clearly becoming industry standards.

Output Format:
The entire response must be a pure JSON object, without any additional text, markdown formatting (other than for the JSON itself), comments, or apologies.

Example JSON Structure (for internal reference, actual content varies based on role):
{
  "${role}": [
    {
      "skill": "HTML",
      "topics": [
        {
          "topicName": "Semantic HTML",
          "description": "Using HTML5 tags for meaningful structure.",
          "completed": false,
          "score": null
        }
      ]
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonRoleObject = parseJson(analysisText);
    if (!jsonRoleObject) {
      throw new Error("Failed to parse generated skill roadmap JSON");
    }

    return jsonRoleObject;
  } catch (error) {
    console.error(`Error generating skill roadmap for role ${role}:`, error);
    throw new Error(
      `Failed to generate roadmap for role: ${role}. ${error.message}`
    );
  }
};

const generateRoleDetails = async (role) => {
  const prompt = `You are a highly specialized data researcher for career platforms, focused on generating accurate and professional job role information. Your task is to create a comprehensive JSON object for a specific job role ${role}, following this exact structure:
{
  "name": "Exact, official job role title",
  "description": "Professional 60-80 word summary of the role, its primary purpose within an organization, key contributions, and overall impact.",
  "skills": ["At least 5 essential technical skills (e.g., programming languages, tools, frameworks)", "At least 3 essential soft skills (e.g., communication, problem-solving, teamwork)"],
  "responsibilities": ["5-7 concise, action-oriented core duties and tasks associated with the role. Each point should be brief and highly accurate."]
}

CRITICAL REQUIREMENTS:
1.  The 'roleName' field MUST be the exact, official title of the job role you are provided.
2.  The 'description' must be a professional summary, strictly between 60-80 words, covering the role's purpose, key contributions, and impact.
3.  'Skills' must be a well-balanced list of at least 5 technical and 3 soft skills, directly relevant to the role.
4.  'responsibilities' must be a list of 5 to 7 concise, action-oriented bullet points, accurately reflecting the core duties of the role. Prioritize clarity and brevity for each point.
5.  Validate all information (description, keySkills, responsibilities) through a minimum of 3 reliable sources (e.g., major job boards, industry-standard role definitions, professional organizations).
6.  Maintain a professional, informative, and appealing tone, suitable for job seekers.
7.  Return ONLY valid JSON with no additional text, explanations, or markdown outside the JSON block.

QUALITY STANDARDS:
-   The 'description' must contain all specified elements within the word count.
-   'Skills' and 'responsibilities' must be highly relevant, accurate, and comprehensive for the specified role.
-   Each responsibility point must be a brief, clear action statement.

**To trigger the response, you must provide the specific job role name.**

For example, if you provide "${role}", the JSON should contain information for that role.

RETURN ONLY THE JSON OBJECT. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonRoleObject = parseJson(analysisText);
    if (!jsonRoleObject) {
      throw new Error("Failed to parse generated role skills JSON");
    }

    return jsonRoleObject;
  } catch (error) {
    console.error(`Error generating data for role ${role}:`, error);
    throw new Error(
      `Failed to generate data for role: ${role}. ${error.message}`
    );
  }
};

const generateCompanyDetails = async (company) => {
  const prompt = `
You are a professional data researcher specializing in company information for career platforms. Your task is to create a comprehensive, accurate JSON object for "${company}" with this exact structure:

{
  "name": "Full official company name",
  "logo": "Working, high-resolution logo URL (must be publicly accessible)",
  "overview": "Professional 60-80 word summary covering founding year, founders, headquarters, core business, key innovations, career culture, global presence, and job seeker appeal",
  "topRoles": ["5 most common roles (prioritize technical roles like SDE, Network Engineer, Cloud Architect, Cybersecurity Analyst, Product Manager)"],
  "locations": ["At most 5 major office locations worldwide with '(HQ)' marking headquarters"]
}

CRITICAL REQUIREMENTS:
1.  The 'logo' field MUST be dynamically generated using the format "https://logo.clearbit.com/{domain}". **For "Technical Hub", ensure you use 'technicalhub.io' as the primary domain to generate the logo URL.** This URL must be functional and point to a high-resolution logo.
2.  Validate all other information (overview, topRoles, locations) through at least 3 reliable sources, specifically focusing on the "Technical Hub" based in Surampalem, Andhra Pradesh, India.
3.  Prioritize career-relevant details for job seekers.
4.  Maintain a professional yet motivational tone.
5.  Return ONLY valid JSON with no additional text or explanations.

QUALITY STANDARDS:
-   The 'logo' URL must be a direct image link (PNG/JPG) generated from the Clearbit API format using ${company}.
-   The 'overview' must include all specified elements.
-   'locations' must be specific office cities, not regions.

RETURN ONLY THE JSON OBJECT. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonCompanyObject = parseJson(analysisText);
    if (!jsonCompanyObject) {
      throw new Error("Failed to parse generated company details JSON");
    }

    return jsonCompanyObject;
  } catch (error) {
    console.error(`Error generating company details for ${company}:`, error);
    throw new Error(
      `Failed to generate company details for: ${company}. ${error.message}`
    );
  }
};

const checkExistingData = async (dreamCompany, dreamRole) => {
  try {
    const [existingCompany, existingRole, existingRoadMap] = await Promise.all([
      companySchema.findOne({ name: dreamCompany }),
      rolesSchema.findOne({ name: dreamRole }),
      roadMapSchema.findOne({ name: dreamRole }),
    ]);

    let companyData = null;
    let roleData = null;
    let roadMapData = null;

    if (existingCompany) {
      try {
        companyData = JSON.parse(existingCompany.data);
      } catch (parseError) {
        console.warn(
          `Error parsing existing company data for ${dreamCompany}:`,
          parseError
        );
      }
    }

    if (existingRole) {
      try {
        roleData = JSON.parse(existingRole.data);
        roadMapData = JSON.parse(existingRoadMap.data);
      } catch (parseError) {
        console.warn(
          `Error parsing existing role data for ${dreamRole}:`,
          parseError
        );
      }
    }

    return {
      company: companyData,
      role: roleData,
      roadMap: roadMapData,
      hasCompany: !!companyData,
      hasRole: !!roleData,
    };
  } catch (error) {
    console.error("Error checking existing data:", error);
    return {
      company: null,
      role: null,
      hasCompany: false,
      hasRole: false,
    };
  }
};

const generateMissingData = async (existingData, dreamCompany, dreamRole) => {
  const { hasCompany, hasRole } = existingData;
  const generationTasks = [];

  if (!hasCompany) {
    console.log(`Generating company details for: ${dreamCompany}`);
    generationTasks.push(
      generateCompanyDetails(dreamCompany).catch((error) => {
        console.error(
          `Failed to generate company details for ${dreamCompany}:`,
          error
        );
        return null;
      })
    );
  }

  if (!hasRole) {
    console.log(`Generating skill roadmap for: ${dreamRole}`);
    generationTasks.push(
      generateSkillRoadmap(dreamRole).catch((error) => {
        console.error(
          `Failed to generate dream Role Data for ${dreamRole}:`,
          error
        );
        return null;
      })
    );
    generationTasks.push(
      generateRoleDetails(dreamRole).catch((error) => {
        console.error(
          `Failed to generate skill roadmap for ${dreamRole}:`,
          error
        );
        return null;
      })
    );
  }

  const results = await Promise.all(generationTasks);

  let newCompanyData = null;
  let newRoleData = null;
  let newRoadMapData = null;

  let resultIndex = 0;
  if (!hasCompany) {
    newCompanyData = results[resultIndex++];
  }
  if (!hasRole) {
    newRoadMapData = results[resultIndex++];
    newRoleData = results[resultIndex++];
  }

  return {
    newCompanyData,
    newRoleData,
    newRoadMapData,
  };
};

const saveNewDataToMasterCollections = async (
  newCompanyData,
  newRoleData,
  newRoadMapData,
  dreamCompany,
  dreamRole
) => {
  const saveOperations = [];

  try {
    if (newCompanyData) {
      saveOperations.push(
        new companySchema({
          name: dreamCompany,
          data: JSON.stringify(newCompanyData),
        }).save()
      );
    }

    if (newRoleData) {
      saveOperations.push(
        new rolesSchema({
          name: dreamRole,
          data: JSON.stringify(newRoleData),
        }).save()
      );
    }
    if (newRoadMapData) {
      saveOperations.push(
        new roadMapSchema({
          name: dreamRole,
          data: JSON.stringify(newRoadMapData),
        }).save()
      );
    }

    if (saveOperations.length > 0) {
      await Promise.all(saveOperations);
      console.log("Successfully saved new data to master collections");
    }
  } catch (error) {
    console.error("Error saving new data to master collections:", error);
    throw new Error(
      `Master collections save operation failed: ${error.message}`
    );
  }
};

const saveToDreamCollections = async (
  companyData,
  roleData,
  roadMapData,
  dreamCompany,
  dreamRole,
  userId
) => {
  const saveOperations = [];

  try {
    if (companyData) {
      saveOperations.push(
        dreamCompanySchema.findOneAndUpdate(
          { userId: userId },
          { userId: userId, ...companyData },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        )
      );
    }
    if (roleData) {
      saveOperations.push(
        dreamRoleSchema.findOneAndUpdate(
          { userId: userId },
          { userId: userId, ...roleData },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        )
      );
    }

    if (roadMapData) {
      let skillsArray = null;

      if (Array.isArray(roadMapData)) {
        skillsArray = roadMapData;
      } else if (
        roadMapData[dreamRole] &&
        Array.isArray(roadMapData[dreamRole])
      ) {
        skillsArray = roadMapData[dreamRole];
      } else if (typeof roadMapData === "object") {
        const keys = Object.keys(roadMapData);
        for (const key of keys) {
          if (Array.isArray(roadMapData[key])) {
            skillsArray = roadMapData[key];
            break;
          }
        }
      }

      if (!Array.isArray(skillsArray)) {
        console.error("Could not find skills array in role data:", roadMapData);
        throw new Error(
          "Invalid role data structure - expected array of skills"
        );
      }

      const transformedSkills = skillsArray.map((skillGroup) => {
        if (!skillGroup || typeof skillGroup !== "object") {
          console.error("Invalid skill group:", skillGroup);
          throw new Error("Invalid skill group structure");
        }

        return {
          skillName:
            skillGroup.skill || skillGroup.skillName || "Unknown Skill",
          description:
            skillGroup.description || `Essential skill for ${dreamRole}`,
          topics: skillGroup.topics || [],
        };
      });

      saveOperations.push(
        dreamRoadMapSchema.findOneAndUpdate(
          { userId: userId },
          {
            userId: userId,
            dreamRole: dreamRole,
            skills: transformedSkills,
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        )
      );
    }

    if (saveOperations.length > 0) {
      await Promise.all(saveOperations);
    }
  } catch (error) {
    console.error("Error saving data to dream collections:", error);
    console.error("Full error details:", error);
    throw new Error(
      `Dream collections save operation failed: ${error.message}`
    );
  }
};

const addDreamRole = async (req, res) => {
  try {
    const { userId, company, role } = req.body;

    if (!userId || !company || !role) {
      return res
        .status(400)
        .json(
          "Missing required fields: userId, company, and role are required"
        );
    }

    const dreamCompany = company.trim().toUpperCase();
    const dreamRole = role.trim().toUpperCase();

    const existingData = await checkExistingData(dreamCompany, dreamRole);

    let finalCompanyData = existingData.company;
    let finalRoleData = existingData.role;
    let finalRoadMapData = existingData.roadMap;

    // if (!existingData.hasCompany || !existingData.hasRole) {
    //   const { newCompanyData, newRoleData, newRoadMapData } = await generateMissingData(
    //     existingData,
    //     dreamCompany,
    //     dreamRole
    //   );

    //   if (!existingData.hasCompany && !newCompanyData) {
    //     return res.status(500).json("Failed to generate company details");
    //   }

    //   if (!existingData.hasRole && !newRoleData) {
    //     return res.status(500).json("Failed to generate role skill roadmap");
    //   }

    //   await saveNewDataToMasterCollections(
    //     newCompanyData,
    //     newRoleData,
    //     newRoadMapData,
    //     dreamCompany,
    //     dreamRole
    //   );

    //   if (newCompanyData) finalCompanyData = newCompanyData;
    //   if (newRoleData) finalRoleData = newRoleData;
    //   if(newRoadMapData) finalRoadMapData = newRoadMapData;
    // }

    // await saveToDreamCollections(
    //   finalCompanyData,
    //   finalRoleData,
    //   finalRoadMapData,
    //   dreamCompany,
    //   dreamRole,
    //   userId
    // );

    if (!existingData.hasCompany || !existingData.hasRole) {
      const { newCompanyData, newRoleData, newRoadMapData } =
        await generateMissingData(existingData, dreamCompany, dreamRole);

      if (!existingData.hasCompany && !newCompanyData) {
        return res.status(500).json("Failed to generate company details");
      }
      if (!existingData.hasRole && !newRoleData) {
        return res.status(500).json("Failed to generate role skill roadmap");
      }

      // Update final data references
      if (newCompanyData) finalCompanyData = newCompanyData;
      if (newRoleData) finalRoleData = newRoleData;
      if (newRoadMapData) finalRoadMapData = newRoadMapData;

      // THIS IS THE KEY OPTIMIZATION: Run both save operations in parallel
      // Instead of: save master -> then save dream (sequential)
      // Do: save master || save dream (parallel)
      await Promise.all([
        saveNewDataToMasterCollections(
          newCompanyData,
          newRoleData,
          newRoadMapData,
          dreamCompany,
          dreamRole
        ),
        saveToDreamCollections(
          finalCompanyData,
          finalRoleData,
          finalRoadMapData,
          dreamCompany,
          dreamRole,
          userId
        ),
      ]);
    } else {
      // If no generation needed, just save to dream collections
      await saveToDreamCollections(
        finalCompanyData,
        finalRoleData,
        finalRoadMapData,
        dreamCompany,
        dreamRole,
        userId
      );
    }
    return res.status(201).json("Dream role created successfully");
  } catch (error) {
    console.error("Error in addDreamRole:", error);
    return res
      .status(500)
      .json("Internal server error while processing dream role");
  }
};

const purify = (analysis) => {
  try {
    const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/) ||
      analysis.match(/```\s*([\s\S]*?)\s*```/) || [null, analysis];
    const jsonStr = jsonMatch[1] || analysis;
    return JSON.parse(jsonStr.trim());
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    return null;
  }
};

const getTopicQuestions = async (req, res) => {
  const { topic, description } = req.body;

  if (!topic) {
    return res.status(400).json("Missing required field Topic");
  }

  if (!description) {
    return res.status(400).json("Missing required field Description");
  }

  const prompt = `Generate exactly 5 unique, beginner-level questions for the topic '{topicName: \"${topic}\", description: \"${description}\"}'.

Requirements:
- Each question must cover a DIFFERENT concept (no repetition).
- Use simple, descriptive language (max 20 words per question).
- Base on real-world scenarios: apps, shopping, games, social media, restaurants, etc.
- Format for mobile users who describe solutions, not write code.
- Use "How would you..." or "Describe..." question formats.
- Target complete beginners with no coding experience.

Return ONLY valid JSON in this exact format:
[
  {"question-1": "..."},
  {"question-2": "..."}....
]`;

  try {
    const result = await model2.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    const parsedAnalysis = purify(analysis);
    if (parsedAnalysis == null) {
      return res
        .status(500)
        .send("Internal Server Error! Please contact support.");
    }

    res.status(200).json(parsedAnalysis);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error!", err: error });
  }
};

const checkTestAnswers = async (req, res) => {
  const { roadMapId, userId, skillId, topicId, answersObject } = req.body;

  if (!userId) {
    return res.status(400).json("Missing required field User ID");
  }
  if (!topicId) {
    return res.status(400).json("Missing required field Topic ID");
  }
  if (!answersObject) {
    res.status(400).send("Missing required fields Answers Object Array");
  }
  if (!skillId) {
    res.status(400).send("Missing required fields Skill ID");
  }
  if (!roadMapId) {
    res.status(400).send("Missing required fields Road Map ID");
  }

  const prompt = `Given the following JSON array containing beginner-level questions and their corresponding human-provided answers for a specific technical concept:${JSON.stringify(
    answersObject
  )}

Please evaluate each 'answer' based on how accurately and clearly it describes a solution to its 'question' in a real-world, mobile-centric scenario, suitable for a complete beginner with no coding experience.

When evaluating:
- **Prioritize conceptual understanding:** Overlook minor typos, grammatical errors, or informal language. Focus on the core idea being conveyed by the human answer.
- **Assess accuracy:** Does the answer correctly describe a relevant solution using the stated concept?
- **Assess clarity and simplicity:** Is the explanation easy for a beginner to understand?
- **Adhere to 'describe solutions, not write code' principle.**

For each question-answer pair in the array, add two new keys:
- "match_score": A percentage (0-100%) indicating how well the answer matches and addresses the question according to the criteria.
- "comment": A brief, professional comment explaining the reasoning for the score and highlighting what was good or what could be improved in the answer's conceptual clarity.

Finally, calculate an "overall_score" for all questions combined by averaging their individual "match_score" percentages.

Return ONLY a valid JSON object in this exact format, with no additional text or formatting:
{
  "score": 1-100,
  "response": [
    {"question-1": "...", "answer-1": "...", "match_score": "...", "comment": "..."}, ....
  ]
}
`;

  try {
    const result = await model2.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    const parsedAnalysis = purify(analysis);
    if (parsedAnalysis == null) {
      return res
        .status(500)
        .send("Internal Server Error! Please contact support.");
    }

    if (parsedAnalysis.score >= 75) {
      const [updateResult, savedTest] = await Promise.all([
        dreamRoadMapSchema.updateOne(
          {
            _id: roadMapId,
            "skills._id": skillId,
            "skills.topics._id": topicId,
          },
          {
            $set: {
              "skills.$[skill].topics.$[topic].completed": true,
              "skills.$[skill].topics.$[topic].score": parsedAnalysis.score,
            },
          },
          {
            arrayFilters: [{ "skill._id": skillId }, { "topic._id": topicId }],
          }
        ),
        testSchema.findOneAndUpdate(
          {
            userId: userId,
            topicId: topicId,
          },
          {
            userId: userId,
            topicId: topicId,
            score: parsedAnalysis.score,
            response: parsedAnalysis.response,
          },
          {
            upsert: true,
            new: true,
          }
        ),
      ]);
    }
    res.status(200).json(parsedAnalysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error!", err: err });
  }
};

const getRoadMap = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    const roadMap = await dreamRoadMapSchema.find({ userId: userId });
    res.status(200).send(roadMap);
  } catch (err) {
    console.log("Error" + err);
    res.status(500).send({
      message: "Internal Server Error! Please contact support.",
      err: err,
    });
  }
};

const getRoleData = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    roleData = await dreamRoleSchema.find({ userId: userId });
    res.status(200).send(roleData);
  } catch (err) {
    console.log("Error" + err);
    res.status(500).send({
      message: "Internal Server Error! Please contact support.",
      err: err,
    });
  }
};

const getCompanyData = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  try {
    const companyData = await dreamCompanySchema.find({ userId: userId });
    res.status(200).send(companyData);
  } catch (err) {
    console.log("Error" + err);
    res.status(500).send({
      message: "Internal Server Error! Please contact support.",
      err: err,
    });
  }
};

const getTopicTestResult = async (req, res) => {
  const { userId, topicId } = req.body;
  console.log(userId, topicId);
  try {
    const topicTestResult = await testSchema.find({
      userId: userId,
      topicId: topicId,
    });
    res.status(200).send(topicTestResult);
  } catch (err) {
    console.log("Error" + err);
    res.status(500).send({
      message: "Internal Server Error! Please contact support.",
      err: err,
    });
  }
};

module.exports = {
  addDreamRole,
  getTopicQuestions,
  checkTestAnswers,
  getRoadMap,
  getCompanyData,
  getRoleData,
  getTopicTestResult,
};
