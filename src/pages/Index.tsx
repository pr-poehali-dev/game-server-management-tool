import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface Server {
  id: string;
  name: string;
  game: 'Minecraft' | 'FiveM' | 'Rust';
  status: 'online' | 'offline';
  players: number;
  maxPlayers: number;
  ip: string;
  cpu: number;
  ram: number;
  uptime: string;
}

interface Player {
  id: string;
  name: string;
  server: string;
  playtime: string;
  warns: number;
}

const mockServers: Server[] = [
  {
    id: '1',
    name: 'RU Survival #1',
    game: 'Minecraft',
    status: 'online',
    players: 47,
    maxPlayers: 100,
    ip: '192.168.1.100:25565',
    cpu: 45,
    ram: 62,
    uptime: '7д 14ч'
  },
  {
    id: '2',
    name: 'Moscow RP',
    game: 'FiveM',
    status: 'online',
    players: 89,
    maxPlayers: 128,
    ip: '192.168.1.101:30120',
    cpu: 78,
    ram: 85,
    uptime: '3д 2ч'
  },
  {
    id: '3',
    name: 'PvP Arena',
    game: 'Rust',
    status: 'offline',
    players: 0,
    maxPlayers: 200,
    ip: '192.168.1.102:28015',
    cpu: 0,
    ram: 0,
    uptime: '0ч'
  }
];

const mockPlayers: Player[] = [
  { id: '1', name: 'DarkKnight', server: 'RU Survival #1', playtime: '142ч', warns: 0 },
  { id: '2', name: 'xXProGamerXx', server: 'Moscow RP', playtime: '89ч', warns: 2 },
  { id: '3', name: 'NoobMaster', server: 'RU Survival #1', playtime: '24ч', warns: 1 },
  { id: '4', name: 'CyberNinja', server: 'Moscow RP', playtime: '201ч', warns: 0 }
];

const mockLogs = [
  { time: '14:32:12', type: 'info', message: 'Сервер RU Survival #1 перезапущен' },
  { time: '14:28:45', type: 'warning', message: 'Высокая нагрузка CPU на Moscow RP (78%)' },
  { time: '14:15:03', type: 'error', message: 'PvP Arena отключен (таймаут соединения)' },
  { time: '14:02:21', type: 'info', message: 'Игрок DarkKnight подключился к RU Survival #1' }
];

export default function Index() {
  const [servers, setServers] = useState<Server[]>(mockServers);
  const [players] = useState<Player[]>(mockPlayers);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [loadingServers, setLoadingServers] = useState<Set<string>>(new Set());
  const [newServer, setNewServer] = useState({
    name: '',
    game: 'Minecraft' as 'Minecraft' | 'FiveM' | 'Rust',
    ip: '',
    maxPlayers: '100'
  });

  const totalPlayers = servers.reduce((sum, s) => sum + s.players, 0);
  const onlineServers = servers.filter(s => s.status === 'online').length;

  const handleServerAction = (serverId: string, action: 'start' | 'stop' | 'restart') => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    setLoadingServers(prev => new Set(prev).add(serverId));

    setTimeout(() => {
      setServers(prevServers => 
        prevServers.map(s => {
          if (s.id === serverId) {
            if (action === 'start') {
              return {
                ...s,
                status: 'online' as const,
                cpu: Math.floor(Math.random() * 50) + 30,
                ram: Math.floor(Math.random() * 40) + 40,
                players: Math.floor(Math.random() * s.maxPlayers * 0.7),
                uptime: '0ч 1м'
              };
            } else if (action === 'stop') {
              return {
                ...s,
                status: 'offline' as const,
                cpu: 0,
                ram: 0,
                players: 0,
                uptime: '0ч'
              };
            } else if (action === 'restart') {
              return {
                ...s,
                cpu: Math.floor(Math.random() * 50) + 30,
                ram: Math.floor(Math.random() * 40) + 40,
                uptime: '0ч 1м'
              };
            }
          }
          return s;
        })
      );

      setLoadingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });

      const actionText = action === 'start' ? 'запущен' : action === 'stop' ? 'остановлен' : 'перезапущен';
      toast({
        title: `Сервер ${actionText}`,
        description: `${server.name} успешно ${actionText}`,
        className: 'bg-neon-green text-background'
      });
    }, 2000);
  };

  const handleAddServer = () => {
    if (!newServer.name || !newServer.ip) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const server: Server = {
      id: String(servers.length + 1),
      name: newServer.name,
      game: newServer.game,
      status: 'offline',
      players: 0,
      maxPlayers: parseInt(newServer.maxPlayers),
      ip: newServer.ip,
      cpu: 0,
      ram: 0,
      uptime: '0ч'
    };

    setServers([...servers, server]);
    setIsAddServerOpen(false);
    setNewServer({ name: '', game: 'Minecraft', ip: '', maxPlayers: '100' });
    
    toast({
      title: 'Сервер добавлен',
      description: `${server.name} успешно добавлен в панель`,
      className: 'bg-neon-cyan text-background'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold neon-glow mb-2">GamePanel</h1>
            <p className="text-muted-foreground">Панель управления игровыми серверами</p>
          </div>
          <Button 
            className="bg-neon-cyan hover:bg-neon-cyan/80 text-background font-bold"
            onClick={() => setIsAddServerOpen(true)}
          >
            <Icon name="Plus" className="mr-2" size={18} />
            Добавить сервер
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-neon-cyan/30 hover:border-neon-cyan transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Всего серверов</CardTitle>
              <Icon name="Server" className="text-neon-cyan" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-cyan">{servers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {onlineServers} онлайн
              </p>
            </CardContent>
          </Card>

          <Card className="border-neon-purple/30 hover:border-neon-purple transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Игроков онлайн</CardTitle>
              <Icon name="Users" className="text-neon-purple" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-purple">{totalPlayers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                из {servers.reduce((sum, s) => sum + s.maxPlayers, 0)} мест
              </p>
            </CardContent>
          </Card>

          <Card className="border-neon-green/30 hover:border-neon-green transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Средняя нагрузка</CardTitle>
              <Icon name="Activity" className="text-neon-green" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-green">
                {Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">CPU</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 hover:border-destructive transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Активных варнов</CardTitle>
              <Icon name="AlertTriangle" className="text-destructive" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {players.reduce((sum, p) => sum + p.warns, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">требуют внимания</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="servers" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="servers" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-background">
              <Icon name="Server" className="mr-2" size={16} />
              Серверы
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-neon-purple data-[state=active]:text-background">
              <Icon name="Users" className="mr-2" size={16} />
              Игроки
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-neon-green data-[state=active]:text-background">
              <Icon name="LineChart" className="mr-2" size={16} />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-background">
              <Icon name="ScrollText" className="mr-2" size={16} />
              Логи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="space-y-4">
            {servers.map((server) => (
              <Card key={server.id} className="border-border/50 hover:border-neon-cyan/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-card rounded-lg border border-neon-cyan/30">
                        <Icon 
                          name={server.game === 'Minecraft' ? 'Box' : server.game === 'FiveM' ? 'Car' : 'Flame'} 
                          className="text-neon-cyan" 
                          size={28} 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{server.name}</h3>
                          <Badge 
                            variant={server.status === 'online' ? 'default' : 'destructive'}
                            className={server.status === 'online' ? 'bg-neon-green text-background animate-pulse-glow' : ''}
                          >
                            {server.status === 'online' ? 'Online' : 'Offline'}
                          </Badge>
                          <Badge variant="outline" className="text-neon-purple border-neon-purple/50">
                            {server.game}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <Icon name="Network" className="inline mr-1" size={14} />
                          {server.ip} • Uptime: {server.uptime}
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-md">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Игроки</p>
                            <p className="text-lg font-bold text-neon-cyan">
                              {server.players}/{server.maxPlayers}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">CPU</p>
                            <div className="flex items-center gap-2">
                              <Progress value={server.cpu} className="h-2 w-16" />
                              <span className="text-sm font-medium">{server.cpu}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">RAM</p>
                            <div className="flex items-center gap-2">
                              <Progress value={server.ram} className="h-2 w-16" />
                              <span className="text-sm font-medium">{server.ram}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-neon-green hover:bg-neon-green hover:text-background transition-all"
                        disabled={server.status === 'online' || loadingServers.has(server.id)}
                        onClick={() => handleServerAction(server.id, 'start')}
                      >
                        {loadingServers.has(server.id) ? (
                          <Icon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="Play" size={16} />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-destructive hover:bg-destructive hover:text-background transition-all"
                        disabled={server.status === 'offline' || loadingServers.has(server.id)}
                        onClick={() => handleServerAction(server.id, 'stop')}
                      >
                        {loadingServers.has(server.id) ? (
                          <Icon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="Square" size={16} />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-neon-cyan hover:bg-neon-cyan hover:text-background transition-all"
                        disabled={loadingServers.has(server.id)}
                        onClick={() => handleServerAction(server.id, 'restart')}
                      >
                        {loadingServers.has(server.id) ? (
                          <Icon name="Loader2" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="RotateCw" size={16} />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-neon-purple hover:bg-neon-purple hover:text-background"
                      >
                        <Icon name="Settings" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" className="text-neon-purple" size={24} />
                  Управление игроками
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-neon-purple/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
                          <Icon name="User" className="text-neon-purple" size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{player.name}</p>
                          <p className="text-sm text-muted-foreground">{player.server}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Playtime</p>
                          <p className="font-medium">{player.playtime}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Warns</p>
                          <Badge variant={player.warns > 0 ? 'destructive' : 'outline'}>
                            {player.warns}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-neon-cyan hover:bg-neon-cyan hover:text-background">
                            <Icon name="MessageSquare" size={16} />
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive hover:bg-destructive hover:text-background">
                            <Icon name="UserX" size={16} />
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive hover:bg-destructive hover:text-background">
                            <Icon name="Ban" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Cpu" className="text-neon-green" size={20} />
                    Нагрузка CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servers.filter(s => s.status === 'online').map(server => (
                      <div key={server.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">{server.name}</span>
                          <span className="text-sm font-bold text-neon-green">{server.cpu}%</span>
                        </div>
                        <Progress value={server.cpu} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="HardDrive" className="text-neon-purple" size={20} />
                    Использование RAM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servers.filter(s => s.status === 'online').map(server => (
                      <div key={server.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">{server.name}</span>
                          <span className="text-sm font-bold text-neon-purple">{server.ram}%</span>
                        </div>
                        <Progress value={server.ram} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ScrollText" className="text-primary" size={24} />
                  Системные логи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {mockLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-3 rounded-lg border border-border/50 font-mono text-sm hover:border-neon-cyan/50 transition-all"
                      >
                        <span className="text-muted-foreground">{log.time}</span>
                        <Badge 
                          variant={log.type === 'error' ? 'destructive' : log.type === 'warning' ? 'outline' : 'default'}
                          className={
                            log.type === 'info' ? 'bg-neon-cyan text-background' : 
                            log.type === 'warning' ? 'border-neon-purple text-neon-purple' : ''
                          }
                        >
                          {log.type}
                        </Badge>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddServerOpen} onOpenChange={setIsAddServerOpen}>
          <DialogContent className="bg-card border-neon-cyan/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Icon name="ServerCog" className="text-neon-cyan" size={24} />
                Добавить сервер
              </DialogTitle>
              <DialogDescription>
                Укажите параметры нового игрового сервера
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Название сервера *
                </Label>
                <Input
                  id="name"
                  placeholder="Например: RU PvP #1"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  className="border-neon-cyan/30 focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game" className="text-sm font-medium">
                  Тип игры *
                </Label>
                <Select
                  value={newServer.game}
                  onValueChange={(value: 'Minecraft' | 'FiveM' | 'Rust') => 
                    setNewServer({ ...newServer, game: value })
                  }
                >
                  <SelectTrigger className="border-neon-cyan/30 focus:border-neon-cyan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-neon-cyan/30">
                    <SelectItem value="Minecraft">
                      <div className="flex items-center gap-2">
                        <Icon name="Box" size={16} className="text-neon-cyan" />
                        Minecraft
                      </div>
                    </SelectItem>
                    <SelectItem value="FiveM">
                      <div className="flex items-center gap-2">
                        <Icon name="Car" size={16} className="text-neon-purple" />
                        FiveM
                      </div>
                    </SelectItem>
                    <SelectItem value="Rust">
                      <div className="flex items-center gap-2">
                        <Icon name="Flame" size={16} className="text-neon-green" />
                        Rust
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip" className="text-sm font-medium">
                  IP:Порт *
                </Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.100:25565"
                  value={newServer.ip}
                  onChange={(e) => setNewServer({ ...newServer, ip: e.target.value })}
                  className="border-neon-cyan/30 focus:border-neon-cyan font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers" className="text-sm font-medium">
                  Максимум игроков
                </Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  placeholder="100"
                  value={newServer.maxPlayers}
                  onChange={(e) => setNewServer({ ...newServer, maxPlayers: e.target.value })}
                  className="border-neon-cyan/30 focus:border-neon-cyan"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddServerOpen(false)}
                className="border-muted-foreground/30 hover:bg-muted"
              >
                Отмена
              </Button>
              <Button
                onClick={handleAddServer}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-background font-bold"
              >
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}