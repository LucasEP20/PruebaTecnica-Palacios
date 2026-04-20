import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';

@Controller('users') // Prefijo de la ruta: /users
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post() // POST /users
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get() // GET /users
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id') // GET /users/:id
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @Put(':id') // PUT /users/:id
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id') // DELETE /users/:id
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }

    // REQUISITOS ESPECIALES DE LA PRUEBA

    @Get(':id/historial') // GET /users/:id/historial
    getHistory(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getHistory(id);
    }

    @Post(':id/notify') // POST /users/:id/notify
    notify(@Param('id', ParseIntPipe) id: number) {
        return this.userService.sendNotification(id);
    }
}