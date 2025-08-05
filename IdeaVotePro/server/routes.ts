import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIdeaSchema, type Idea } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all ideas
  app.get("/api/ideas", async (req, res) => {
    try {
      const ideas = await storage.getAllIdeas();
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  // Create new idea
  app.post("/api/ideas", async (req, res) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const idea = await storage.createIdea(validatedData);
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create idea" });
      }
    }
  });

  // Vote for idea
  app.post("/api/ideas/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const idea = await storage.getIdeaById(id);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const updatedIdea = await storage.updateIdeaVotes(id, idea.votes + 1);
      res.json(updatedIdea);
    } catch (error) {
      res.status(500).json({ message: "Failed to vote for idea" });
    }
  });

  // Track idea view
  app.post("/api/ideas/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const idea = await storage.getIdeaById(id);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const updatedIdea = await storage.updateIdeaViews(id);
      res.json(updatedIdea);
    } catch (error) {
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const ideas = await storage.getAllIdeas();
      const totalIdeas = ideas.length;
      const totalVotes = ideas.reduce((sum, idea) => sum + idea.votes, 0);
      const avgRating = totalIdeas > 0 
        ? Math.round(ideas.reduce((sum, idea) => sum + idea.aiRating, 0) / totalIdeas)
        : 0;

      res.json({
        totalIdeas,
        totalVotes,
        avgRating,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
