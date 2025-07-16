import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Trophy, Users, Star } from "lucide-react";

const Community = () => {
  const posts = [
    {
      id: 1,
      author: "Sarah M.",
      avatar: "SM",
      time: "2h ago",
      content: "Just hit my 30-day keto milestone! Down 15 lbs and feeling amazing. The energy boost is incredible! 🎉",
      image: "🎯",
      likes: 24,
      comments: 8,
      tags: ["Milestone", "Success"]
    },
    {
      id: 2,
      author: "Mike R.",
      avatar: "MR",
      time: "4h ago",
      content: "Made the most amazing keto chocolate chip cookies today. Recipe in comments! Zero guilt, all flavor 😋",
      image: "🍪",
      likes: 31,
      comments: 12,
      tags: ["Recipe", "Dessert"]
    },
    {
      id: 3,
      author: "Emma L.",
      avatar: "EL",
      time: "6h ago",
      content: "Week 3 progress update: Already seeing changes in my measurements. This community keeps me motivated! 💪",
      image: "📊",
      likes: 18,
      comments: 6,
      tags: ["Progress", "Motivation"]
    }
  ];

  const challenges = [
    { name: "30-Day Keto Challenge", participants: 1247, daysLeft: 12 },
    { name: "Sugar-Free February", participants: 892, daysLeft: 8 },
    { name: "10K Steps Daily", participants: 634, daysLeft: 20 }
  ];

  return (
    <section id="community" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Join Our Keto Community
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with thousands of keto enthusiasts. Share your journey, 
            get support, and celebrate wins together.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-keto-green to-keto-orange text-white">
                            {post.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{post.author}</span>
                            <span className="text-sm text-muted-foreground">{post.time}</span>
                          </div>
                          <p className="text-sm mb-3">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-keto-green transition-colors">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-keto-green transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </button>
                            <button className="flex items-center gap-1 hover:text-keto-green transition-colors">
                              <Share2 className="h-4 w-4" />
                              Share
                            </button>
                          </div>
                        </div>
                        <div className="text-4xl">{post.image}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="text-center">
                <Button variant="outline">Load More Posts</Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-keto-orange" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <div key={index} className="p-4 bg-secondary rounded-lg">
                      <h4 className="font-semibold mb-2">{challenge.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {challenge.participants}
                        </div>
                        <div>{challenge.daysLeft} days left</div>
                      </div>
                      <Button size="sm" className="w-full bg-gradient-to-r from-keto-green to-keto-orange">
                        Join Challenge
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Jessica K.", posts: 47, avatar: "JK" },
                    { name: "David P.", posts: 38, avatar: "DP" },
                    { name: "Maria S.", posts: 31, avatar: "MS" }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-keto-orange">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-keto-green to-keto-orange text-white text-xs">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.posts} posts</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-keto-green">50,247</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-keto-orange">2,847</div>
                    <div className="text-sm text-muted-foreground">Success Stories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1,249</div>
                    <div className="text-sm text-muted-foreground">Active Today</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;