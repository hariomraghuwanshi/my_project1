import { type User, type InsertUser, type Idea, type InsertIdea } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Idea methods
  createIdea(idea: InsertIdea): Promise<Idea>;
  getAllIdeas(): Promise<Idea[]>;
  getIdeaById(id: string): Promise<Idea | undefined>;
  updateIdeaVotes(id: string, votes: number): Promise<Idea | undefined>;
  updateIdeaViews(id: string): Promise<Idea | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ideas: Map<string, Idea>;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createIdea(insertIdea: InsertIdea): Promise<Idea> {
    const id = randomUUID();
    
    // Generate AI rating (weighted between 60-95 for realism)
    const aiRating = Math.floor(Math.random() * 35) + 60;
    
    const idea: Idea = {
      ...insertIdea,
      id,
      aiRating,
      votes: 0,
      views: 0,
      createdAt: new Date(),
    };
    
    this.ideas.set(id, idea);
    return idea;
  }

  async getAllIdeas(): Promise<Idea[]> {
    return Array.from(this.ideas.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIdeaById(id: string): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async updateIdeaVotes(id: string, votes: number): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;
    
    const updatedIdea = { ...idea, votes };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async updateIdeaViews(id: string): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;
    
    const updatedIdea = { ...idea, views: idea.views + 1 };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }
}

export const storage = new MemStorage();
